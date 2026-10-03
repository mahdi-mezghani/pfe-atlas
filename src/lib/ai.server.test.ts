import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDeterministicGenerationConfig,
  buildGeminiGenerationConfig,
  getModelRateLimitCooldownUntil,
  isModelSpecificRateLimit,
  markModelRateLimited,
  ModelCoolingDownError,
  ModelRateLimitError,
  normalizeProvider,
  chatWithModel,
} from './ai.server.ts';

test('normalizeProvider recognizes Gemini aliases', () => {
  assert.equal(normalizeProvider('gemini'), 'gemini');
  assert.equal(normalizeProvider('google'), 'gemini');
  assert.equal(normalizeProvider('google-ai'), 'gemini');
});

test('normalizeProvider keeps OpenAI-compatible providers as non-Gemini', () => {
  assert.equal(normalizeProvider('openrouter'), 'openrouter');
  assert.equal(normalizeProvider('anthropic'), 'anthropic');
  assert.equal(normalizeProvider('deepseek'), 'deepseek');
});

test('buildDeterministicGenerationConfig forces low-variance generation', () => {
  const config = buildDeterministicGenerationConfig();
  assert.deepEqual(config, {
    temperature: 0,
    topP: 0.2,
    candidateCount: 1,
    maxOutputTokens: 2048,
  });
});

test('buildGeminiGenerationConfig requests JSON output for schema-guided generation', () => {
  assert.deepEqual(buildGeminiGenerationConfig(true), {
    temperature: 0,
    topP: 0.2,
    candidateCount: 1,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  });
  assert.deepEqual(buildGeminiGenerationConfig(), buildDeterministicGenerationConfig());
});

test('only model-specific Gemini quota errors trigger a model cooldown', () => {
  assert.equal(isModelSpecificRateLimit(JSON.stringify({
    error: {
      details: [{ violations: [{ quotaId: 'GenerateContentRequestsPerModelPerMinute' }] }],
    },
  })), true);
  assert.equal(isModelSpecificRateLimit(JSON.stringify({
    error: {
      details: [{ violations: [{ quotaId: 'GenerateContentRequestsPerProjectPerMinute' }] }],
    },
  })), false);
  assert.equal(isModelSpecificRateLimit('not json'), false);
});

test('model cooldown expires after 24 hours', () => {
  const model = 'cooldown-test-model';
  const now = 1_000;
  const cooldownUntil = markModelRateLimited(model, now);

  assert.equal(cooldownUntil, now + 24 * 60 * 60 * 1000);
  assert.equal(getModelRateLimitCooldownUntil(model, now), cooldownUntil);
  assert.equal(getModelRateLimitCooldownUntil(model, cooldownUntil - 1), cooldownUntil);
  assert.equal(getModelRateLimitCooldownUntil(model, cooldownUntil), null);
});

test('a model-specific Gemini 429 cools down that model and skips later requests', async () => {
  const envKeys = ['AI_PROVIDER', 'AI_BASE_URL', 'AI_API_KEY', 'AI_GEMINI_API_KEY', 'AI_GEMINI_USE_API_KEY'];
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  const model = 'gemini-cooldown-test';
  let requestCount = 0;

  process.env.AI_PROVIDER = 'gemini';
  process.env.AI_BASE_URL = 'https://cooldown-test.invalid';
  process.env.AI_API_KEY = 'AIza-test-key';
  delete process.env.AI_GEMINI_API_KEY;
  process.env.AI_GEMINI_USE_API_KEY = 'true';
  globalThis.fetch = async () => {
    requestCount += 1;
    return new Response(JSON.stringify({
      error: {
        code: 429,
        details: [{ violations: [{ quotaId: 'GenerateContentRequestsPerModelPerMinute' }] }],
      },
    }), { status: 429 });
  };

  try {
    await assert.rejects(
      chatWithModel([{ role: 'user', content: 'test' }], { model, allowModelFallback: false }),
      ModelRateLimitError,
    );
    const cooldownUntil = getModelRateLimitCooldownUntil(model);
    assert.ok(cooldownUntil && cooldownUntil > Date.now());

    await assert.rejects(
      chatWithModel([{ role: 'user', content: 'test again' }], { model, allowModelFallback: false }),
      ModelCoolingDownError,
    );
    assert.equal(requestCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of envKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
});

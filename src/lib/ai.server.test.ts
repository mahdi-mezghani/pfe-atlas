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
  embed,
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

test('Ollama can provide local embeddings independently of Gemini chat', async () => {
  const envKeys = [
    'AI_PROVIDER',
    'AI_GEMINI_API_KEY',
    'AI_API_KEY',
    'AI_EMBEDDING_PROVIDER',
    'AI_OLLAMA_BASE_URL',
    'AI_OLLAMA_EMBEDDING_MODEL',
    'AI_OLLAMA_KEEP_ALIVE',
    'AI_OLLAMA_NUM_THREADS',
  ];
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let requestUrl = '';
  let requestBody: Record<string, unknown> | undefined;
  let requestHeaders: Headers | undefined;
  const vectors = ['first', 'second'].map((_, index) => Array.from({ length: 3072 }, () => index));

  process.env.AI_PROVIDER = 'gemini';
  process.env.AI_GEMINI_API_KEY = 'AIza-chat-test';
  delete process.env.AI_API_KEY;
  process.env.AI_EMBEDDING_PROVIDER = 'ollama';
  process.env.AI_OLLAMA_BASE_URL = 'http://127.0.0.1:11434/';
  process.env.AI_OLLAMA_EMBEDDING_MODEL = 'qwen3-embedding:latest';
  process.env.AI_OLLAMA_KEEP_ALIVE = '60s';
  process.env.AI_OLLAMA_NUM_THREADS = '4';
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    requestHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ embeddings: vectors }), { status: 200 });
  };

  try {
    const result = await embed(['first report chunk', 'second report chunk']);

    assert.equal(requestUrl, 'http://127.0.0.1:11434/api/embed');
    assert.deepEqual(requestBody, {
      model: 'qwen3-embedding:latest',
      input: ['first report chunk', 'second report chunk'],
      dimensions: 3072,
      keep_alive: '60s',
      options: { num_thread: 4 },
    });
    assert.equal(requestHeaders?.get('authorization'), null);
    assert.equal(result.length, 2);
    assert.equal(result[0].length, 3072);
    assert.equal(result[1][0], 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of envKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
});

test('Ollama embeddings reject invalid CPU thread limits', async () => {
  const envKeys = ['AI_PROVIDER', 'AI_EMBEDDING_PROVIDER', 'AI_OLLAMA_NUM_THREADS'];
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  process.env.AI_PROVIDER = 'gemini';
  process.env.AI_EMBEDDING_PROVIDER = 'ollama';
  process.env.AI_OLLAMA_NUM_THREADS = '0';
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ embeddings: [] }), { status: 200 });
  };

  try {
    await assert.rejects(embed(['report chunk']), /AI_OLLAMA_NUM_THREADS must be a positive integer/);
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of envKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
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

test('buildGeminiGenerationConfig supplies native JSON schema mode with room for metadata output', () => {
  const responseSchema = { type: 'object', properties: { title: { type: 'string' } } };
  assert.deepEqual(buildGeminiGenerationConfig(responseSchema), {
    temperature: 0,
    topP: 0.2,
    candidateCount: 1,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
    responseSchema,
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

test('Gemini metadata requests pass the native response schema and capture completion details', async () => {
  const envKeys = ['AI_PROVIDER', 'AI_BASE_URL', 'AI_API_KEY', 'AI_GEMINI_API_KEY', 'AI_GEMINI_USE_API_KEY'];
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;

  process.env.AI_PROVIDER = 'gemini';
  process.env.AI_BASE_URL = 'https://schema-test.invalid';
  process.env.AI_API_KEY = 'AIza-test-key';
  delete process.env.AI_GEMINI_API_KEY;
  process.env.AI_GEMINI_USE_API_KEY = 'true';
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({
      candidates: [{
        content: { parts: [{ text: '{"title":"Report"}' }] },
        finishReason: 'STOP',
      }],
      usageMetadata: { candidatesTokenCount: 19 },
    }), { status: 200 });
  };

  try {
    const result = await chatWithModel([{ role: 'user', content: 'Extract metadata' }], {
      model: 'gemini-schema-test',
      allowModelFallback: false,
      json_schema: {
        name: 'metadata',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: { title: { type: 'string' } },
          required: ['title'],
        },
      },
    });

    const generationConfig = requestBody?.generationConfig as Record<string, unknown>;
    assert.deepEqual(generationConfig.responseSchema, {
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
    });
    assert.equal(generationConfig.responseMimeType, 'application/json');
    assert.equal(generationConfig.maxOutputTokens, 4096);
    assert.equal(result.finishReason, 'STOP');
    assert.equal(result.outputTokens, 19);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of envKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
});

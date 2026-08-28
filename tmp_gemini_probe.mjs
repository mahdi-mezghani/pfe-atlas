import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const envPath = resolve('.', '.env');
const env = parseEnv(readFileSync(envPath, 'utf8'));
console.log('ENV keys:', Object.keys(env).filter((k) => k.startsWith('AI_')));
console.log('provider', env.AI_PROVIDER, 'base', env.AI_BASE_URL);

const tests = [
  {
    name: 'gemini chat',
    url: `${env.AI_BASE_URL}/v1beta/models/${env.AI_GEMINI_CHAT_MODEL}:generateContent`,
    body: {
      model: env.AI_GEMINI_CHAT_MODEL,
      prompt: {
        text: 'Human: Hello\n\nAssistant: Reply with ok.',
      },
    },
  },
  {
    name: 'gemini embed',
    url: `${env.AI_BASE_URL}/v1beta/models/${env.AI_GEMINI_EMBEDDING_MODEL}:embedContent`,
    body: {
      model: env.AI_GEMINI_EMBEDDING_MODEL,
      input: ['hello world'],
    },
  },
  {
    name: 'gemini chat alt',
    url: `${env.AI_BASE_URL}/v1beta/models/${env.AI_GEMINI_CHAT_MODEL}:generateText`,
    body: {
      model: env.AI_GEMINI_CHAT_MODEL,
      prompt: {
        text: 'Human: Hello\n\nAssistant: Reply with ok.',
      },
    },
  },
  {
    name: 'gemini embed alt',
    url: `${env.AI_BASE_URL}/v1beta/models/${env.AI_GEMINI_EMBEDDING_MODEL}:embedText`,
    body: {
      model: env.AI_GEMINI_EMBEDDING_MODEL,
      input: ['hello world'],
    },
  },
];

for (const test of tests) {
  try {
    const res = await fetch(test.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_GEMINI_API_KEY}`,
      },
      body: JSON.stringify(test.body),
    });
    const text = await res.text();
    console.log('---', test.name, test.url, 'status', res.status, res.statusText);
    if (text.length > 0) {
      console.log(text.slice(0, 1600));
    }
  } catch (err) {
    console.error('ERROR', test.name, err);
  }
}

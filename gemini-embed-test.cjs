const fetch = require('node-fetch');
const key = 'AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ';
const model = 'models/gemini-embedding-2';
const tests = [
  ['embedText', { text: 'Hello' }],
  ['embedText', { model, text: 'Hello' }],
  ['batchEmbedText', { texts: ['Hello', 'World'] }],
  ['batchEmbedText', { requests: [{ text: 'Hello' }, { text: 'World' }] }],
  ['batchEmbedText', { requests: [{ model, text: 'Hello' }, { model, text: 'World' }] }],
  ['embedContent', { content: { role: 'user', parts: [{ text: 'Hello' }] } }],
];
(async () => {
  for (const [path, body] of tests) {
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:${path}?key=${key}`;
    console.log('---', path, JSON.stringify(body));
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    console.log('status', res.status);
    console.log(await res.text());
    console.log();
  }
})();
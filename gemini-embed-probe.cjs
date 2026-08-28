const fetch = require('node-fetch');
const key = 'AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ';
const model = 'gemini-embedding-2';
const base = 'https://generativelanguage.googleapis.com/v1beta/models';
const probe = async () => {
  const urls = [
    `${base}/${model}?key=${key}`,
    `${base}/${model}:embedText?key=${key}`,
    `${base}/${model}:batchEmbedText?key=${key}`,
    `${base}/${model}:embedContent?key=${key}`,
  ];
  for (const url of urls) {
    console.log('URL', url);
    const body = url.endsWith('batchEmbedText?key=' + key)
      ? { requests: [{ model, text: 'Hello' }, { model, text: 'World' }] }
      : url.includes(':embedText')
      ? { model, text: 'Hello' }
      : url.includes(':embedContent')
      ? { model, content: { role: 'user', parts: [{ text: 'Hello' }] } }
      : null;
    const opts = { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
    console.log('---');
  }
};
probe().catch((err) => { console.error(err); process.exit(1); });
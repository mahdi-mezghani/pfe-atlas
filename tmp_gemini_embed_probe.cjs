const fetch = require('node-fetch');
const key = 'AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ';
const models = [
  'models/gemini-embedding-2',
  'models/gemini-embedding-2-preview',
  'models/gemini-embedding-001',
];
(async () => {
  for (const model of models) {
    const paths = [
      `/${model}:embedContent`,
      `/${model}:batchEmbedContents`,
      `/${model}:batchEmbedText`,
    ];
    for (const path of paths) {
      const url = `https://generativelanguage.googleapis.com/v1beta${path}?key=${key}`;
      const body = path.endsWith('embedContent')
        ? { content: { role: 'user', parts: [{ text: 'Hello' }] } }
        : { requests: [{ content: { role: 'user', parts: [{ text: 'Hello' }] } }, { content: { role: 'user', parts: [{ text: 'World' }] } }] };
      console.log('----', url);
      console.log('BODY', JSON.stringify(body));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log('status', res.status);
      console.log(await res.text());
      console.log();
    }
  }
})();

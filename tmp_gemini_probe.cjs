const key = process.env.AI_GEMINI_API_KEY || process.env.AI_API_KEY;
if (!key) {
  console.error('Missing Gemini API key environment variable');
  process.exit(1);
}
const base = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:';
const tests = [
  ['generateContent-simple', { model: 'models/gemini-3.6-flash', contents: [{ role: 'user', parts: [{ text: 'Hello' }] }] }],
  ['generateContent-system', { model: 'models/gemini-3.6-flash', contents: [{ role: 'user', parts: [{ text: 'Hello' }] }], systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] } }],
  ['generateContent-noModel', { contents: [{ role: 'user', parts: [{ text: 'Hello' }] }] }],
  ['batchEmbedText-texts', { texts: ['Hello', 'World'] }],
  ['batchEmbedText-requests', { requests: [{ text: 'Hello' }, { text: 'World' }] }],
];
(async () => {
  for (const [path, body] of tests) {
    const url = `${base}${path}?key=${key}`;
    console.log('---', path, JSON.stringify(body));
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
  }
})();

const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const base = "https://generativelanguage.googleapis.com/v1beta";
const fetchJson = async (path, body) => {
  const url = `${base}${path}?key=${key}`;
  console.log(`REQUEST ${url}`);
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
  console.log('---');
};

(async () => {
  await fetchJson('/models');
  await fetchJson('/models/gemini-3.6-flash:generateContent', {
    model: 'models/gemini-3.6-flash',
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
  });
  await fetchJson('/models/gemini-3.6-flash:generateMessage', {
    messages: [{ author: 'user', content: [{ type: 'text', text: 'Hello' }] }],
  });
  await fetchJson('/models/gemini-embedding-2:embedText', { text: 'Hello' });
  await fetchJson('/models/gemini-embedding-2:batchEmbedText', { texts: ['Hello', 'World'] });
})();

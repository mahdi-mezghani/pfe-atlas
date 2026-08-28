const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const fetchJson = async (url, body) => {
  console.log('URL', url);
  console.log('BODY', JSON.stringify(body));
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  console.log('STATUS', res.status);
  console.log(await res.text());
  console.log('---');
};
(async () => {
  await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`, { model: 'models/gemini-3.6-flash', contents: [{ role: 'user', parts: [{ text: 'Hello' }] }] });
  await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`, { model: 'models/gemini-3.6-flash', contents: [{ role: 'user', parts: [{ text: 'Hello' }] }], systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] } });
  await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedText?key=${key}`, { texts: ['Hello','World'] });
})();
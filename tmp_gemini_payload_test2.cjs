const key = 'AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ';
const fetchJson = async (url, body) => {
  console.log('URL', url);
  console.log('BODY', JSON.stringify(body));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
  console.log('---');
};
(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
  await fetchJson(url, {
    model: 'models/gemini-3.6-flash',
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
  });
  await fetchJson(url, {
    model: 'gemini-3.6-flash',
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
  });
  await fetchJson(url, {
    model: 'models/gemini-3.6-flash',
    systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] },
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
  });
})();

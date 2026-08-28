const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const base = "https://generativelanguage.googleapis.com/v1beta";
const fetchJson = async (path, method = 'GET', body) => {
  const url = `${base}${path}?key=${key}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  console.log('===', path, method);
  console.log('status', res.status);
  console.log(text);
};
(async () => {
  await fetchJson('/models');
  await fetchJson('/models/gemini-3.6-flash');
  await fetchJson('/models/gemini-3.6-flash:generateText', 'POST', { prompt: 'Hello' });
  await fetchJson('/models/gemini-3.6-flash:generateText', 'POST', { prompt: { text: 'Hello' } });
  await fetchJson('/models/gemini-3.6-flash:generateMessage', 'POST', { messages: [{ author:'user', content:[{ type:'text', text:'Hello'}] }] });
  await fetchJson('/models/gemini-3.6-flash:generateMessage', 'POST', { prompt: { messages:[{ author:'user', content:[{ type:'text', text:'Hello'}] }] } });
  await fetchJson('/models/gemini-3.6-flash:embedText', 'POST', { text: 'Hello' });
  await fetchJson('/models/gemini-embedding-2:embedText', 'POST', { text: 'Hello' });
})();

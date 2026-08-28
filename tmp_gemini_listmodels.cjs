const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const fetch = global.fetch || require('node-fetch');
(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const body = await res.json();
  const models = body.models || [];
  for (const model of models) {
    if (model.name.includes('gemini-embedding') || model.name.includes('embedding')) {
      console.log(model.name, JSON.stringify(model.supportedGenerationMethods || []));
    }
  }
})();

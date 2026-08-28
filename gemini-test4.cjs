const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const base = "https://generativelanguage.googleapis.com/v1beta/models";
const tests = [
  ["gemini-3.6-flash:generateContent", { contents: [{ role: "user", parts: [{ text: "Hello" }] }] }],
  ["gemini-3.6-flash:generateContent", { contents: [{ role: "user", parts: [{ text: "What is 2 + 2?" }] }], generationConfig: { maxOutputTokens: 32 } }],
  ["gemini-3.6-flash:generateContent", { systemInstruction: { parts: [{ text: "You are a helpful assistant." }] }, contents: [{ role: "user", parts: [{ text: "Summarize Hello" }] }] }],
  ["gemini-embedding-2:embedText", { text: "Hello" }],
  ["gemini-embedding-2:embedText", { model: "gemini-embedding-2", text: "Hello" }],
  ["gemini-embedding-2:batchEmbedText", { requests: [{ text: "Hello" }, { text: "World" }] }],
];
const run = async () => {
  for (const [path, body] of tests) {
    const url = `${base}/${path}?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log('----', path);
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
    console.log();
  }
};
run().catch((err) => { console.error(err); process.exit(1); });
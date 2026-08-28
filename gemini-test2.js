const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const base = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:";
const tests = [
  ["generateContent", { text: "Hello" }],
  ["generateContent", { content: [{ type: "text", text: "Hello" }] }],
  ["generateContent", { instances: [{ content: [{ type: "text", text: "Hello" }] }] }],
  ["generateContent", { instances: [{ content: [{ type: "text", text: "Hello" }], author: "user" }] }],
  ["generateContent", { instances: [{ content: [{ type: "text", text: "Hello" }], role: "user" }] }],
  ["generateContent", { instances: [{ content: [{ type: "text", text: "Hello" }], mime_type: "text/plain" }] }],
  ["embedText", { text: "Hello" }],
  ["embedText", { instances: [{ text: "Hello" }] }],
  ["embedText", { text: ["Hello"] }],
  ["embedContent", { content: [{ type: "text", text: "Hello" }] }],
  ["embedContent", { instances: [{ content: [{ type: "text", text: "Hello" }] }] }],
  ["embedContent", { input: ["Hello"] }],
  ["embedContent", { text: ["Hello"] }],
  ["embedContent", { model: "gemini-embedding-2", text: "Hello" }],
  ["embedContent", { model: "gemini-embedding-2", input: ["Hello"] }],
  ["embedContent", { model: "gemini-embedding-2", instances: [{ text: "Hello" }] }],
];

const run = async () => {
  for (const [path, body] of tests) {
    const url = `${base}${path}?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("---", path, JSON.stringify(body));
    console.log(res.status);
    console.log(await res.text());
    console.log();
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
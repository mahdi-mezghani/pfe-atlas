const key = "AQ.Ab8RN6JYzaKDTWvytKyOJ4fxa6Un_L0thhqfFD3evg2BqPAVYQ";
const base = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:";
const tests = [
  ["generateText", { prompt: { text: "Hello" } }],
  ["generateText", { prompt: { messages: [{ author: "user", content: [{ type: "text", text: "Hello" }] }] } }],
  ["generateMessage", { messages: [{ author: "user", content: [{ type: "text", text: "Hello" }] }] }],
  ["embedContent", { model: "gemini-embedding-2", input: ["Hello"] }],
  ["embedContent", { model: "gemini-embedding-2", text: ["Hello"] }]
];
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
}

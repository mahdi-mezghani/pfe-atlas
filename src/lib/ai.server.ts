// Server-only AI helpers.
// Supports OpenAI-compatible providers and Google Gemini providers.
// Uses Gemini or an OpenAI-compatible AI provider configured by environment variables.
//   AI_PROVIDER            openai | gemini
//   AI_BASE_URL            provider base URL
//   AI_API_KEY             OpenAI-style API key / Gemini bearer token
//   AI_GEMINI_API_KEY      Gemini-specific bearer token
//   AI_CHAT_MODEL          OpenAI-compatible chat model override
//   AI_EMBEDDING_MODEL     OpenAI-compatible embedding model override
//   AI_GEMINI_CHAT_MODEL   Gemini chat model override
//   AI_GEMINI_EMBEDDING_MODEL Gemini embedding model override
//   AI_GEMINI_USE_API_KEY   true to send Gemini key as `?key=...` instead of a bearer token
const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";

function provider() {
  return (process.env.AI_PROVIDER ?? "openai").toLowerCase();
}

function base() {
  if (provider() === "gemini") {
    return process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com";
  }
  return process.env.AI_BASE_URL || DEFAULT_OPENAI_BASE;
}

function isGeminiApiKey(key?: string) {
  return typeof key === "string" && key.startsWith("AIza");
}

function isGeminiBearerToken(key?: string) {
  return typeof key === "string" && (key.startsWith("ya29.") || key.startsWith("AQ.") || key.startsWith("eyJ") || key.startsWith("1/"));
}

function useGeminiKeyAsQueryParam() {
  const override = process.env.AI_GEMINI_USE_API_KEY?.toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  const key = process.env.AI_GEMINI_API_KEY ?? process.env.AI_API_KEY;
  if (!key) return false;

  return isGeminiApiKey(key);
}

function geminiUrl(path: string) {
  const url = new URL(path, base());
  if (provider() === "gemini" && useGeminiKeyAsQueryParam()) {
    const key = process.env.AI_GEMINI_API_KEY ?? process.env.AI_API_KEY;
    if (!key) throw new Error("Missing AI_GEMINI_API_KEY / AI_API_KEY for Gemini.");
    url.searchParams.set("key", key);
  }
  return url.toString();
}

function chatModel() {
  if (provider() === "gemini") {
    return process.env.AI_GEMINI_CHAT_MODEL || "gemini-3.6-flash";
  }
  return process.env.AI_CHAT_MODEL || "openai/gpt-5.5";
}

function embeddingModel() {
  if (provider() === "gemini") {
    return process.env.AI_GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
  }
  return process.env.AI_EMBEDDING_MODEL || "google/gemini-embedding-2";
}

function maskKey(s?: string) {
  if (!s) return s;
  if (s.length <= 10) return s;
  return s.slice(0, 6) + "..." + s.slice(-4);
}

function headers(): Record<string, string> {
  const apiKey = process.env.AI_API_KEY;
  const geminiKey = process.env.AI_GEMINI_API_KEY;
  const chosenKey = provider() === "gemini" ? geminiKey ?? apiKey : apiKey;
  const useQueryKey = provider() === "gemini" && useGeminiKeyAsQueryParam();

  try {
    // eslint-disable-next-line no-console
    console.debug(
      '[ai] provider=%s base=%s auth=%s api_key=%s',
      provider(),
      base(),
      provider() === "gemini" ? (useQueryKey ? "query" : "bearer") : "bearer",
      maskKey(chosenKey),
    );
  } catch (e) {
    /* ignore debug failures */
  }

  if (provider() === "gemini") {
    if (!chosenKey) throw new Error("Missing AI_GEMINI_API_KEY / AI_API_KEY for Gemini.");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!useQueryKey) {
      headers.Authorization = `Bearer ${chosenKey}`;
    }
    return headers;
  }

  if (apiKey) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  throw new Error("Missing AI_API_KEY for the configured AI provider.");
}

function buildGeminiPrompt(messages: ChatMessage[], jsonSchema?: { name: string; schema: unknown }) {
  const content = messages.map((message) => message.content).join("\n\n");

  if (!jsonSchema) return content;

  return `${content}\n\nReturn only valid JSON that conforms to the following schema:\n${JSON.stringify(
    jsonSchema.schema,
    null,
    2,
  )}\n\nDo not include any extra text.`;
}

export async function embed(inputs: string[]): Promise<number[][]> {
  const out: number[][] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i += 100) {
    const batch = inputs.slice(i, i + 100);
    let res;
    if (provider() === "gemini") {
      const modelName = `models/${embeddingModel()}`;
      const body = {
        requests: batch.map((text) => ({
          model: modelName,
          content: { role: "user", parts: [{ text }] },
        })),
      };
      res = await fetch(geminiUrl(`/v1beta/${modelName}:batchEmbedContents`), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${base()}/embeddings`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ model: embeddingModel(), input: batch }),
      });
    }

    if (!res.ok) {
      throw new Error(`Embedding failed (${res.status}): ${await res.text()}`);
    }

    const j = await res.json();
    const data = Array.isArray(j.embeddings)
      ? j.embeddings
      : Array.isArray(j.data)
      ? j.data
      : Array.isArray(j.responses)
      ? j.responses
      : [];

    for (const [index, item] of data.entries()) {
      const embedding =
        (item as any).values ??
        (item as any).embedding?.values ??
        (item as any).embedding ??
        (item as any).value;
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Unexpected embedding response format.");
      }
      out[i + index] = embedding;
    }
  }
  return out;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(
  messages: ChatMessage[],
  opts: {
    model?: string;
    json_schema?: { name: string; schema: unknown };
  } = {},
): Promise<string> {
  if (provider() === "gemini") {
    const model = opts.model ?? chatModel();
    const systemMessages = messages.filter((message) => message.role === "system");
    const userAndAssistant = messages.filter((message) => message.role !== "system");
    const body: Record<string, unknown> = {
      model,
      contents: userAndAssistant.map((message) => ({
        role: message.role === "assistant" ? "model" : message.role,
        parts: [{ text: message.content }],
      })),
    };

    if (systemMessages.length) {
      body.systemInstruction = {
        parts: [{ text: buildGeminiPrompt(systemMessages, opts.json_schema) }],
      };
    }

    const res = await fetch(geminiUrl(`/v1beta/models/${model}:generateContent`), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed (${res.status}): ${text}`);
    }

    const j = await res.json();
    const candidateContent =
      j.candidates?.[0]?.content ??
      j.output?.[0]?.content ??
      undefined;
    const candidateText =
      candidateContent?.parts?.map((part: any) => part.text).filter(Boolean).join(" ") ||
      j.candidates?.[0]?.content?.[0]?.text ||
      j.output?.[0]?.content?.[0]?.text ||
      j.completion ||
      "";
    return String(candidateText);
  }

  const body: Record<string, unknown> = {
    model: opts.model ?? chatModel(),
    messages,
  };
  if (opts.json_schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: opts.json_schema.name,
        strict: true,
        schema: opts.json_schema.schema,
      },
    };
  }
  const res = await fetch(`${base()}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}): ${text}`);
  }
  const j = (await res.json()) as { choices: { message: { content: string } }[] };
  return j.choices[0]?.message?.content ?? "";
}

export function vectorLiteral(vec: number[]): string {
  return "[" + vec.join(",") + "]";
}

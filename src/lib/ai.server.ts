// Server-only AI helpers.
// Supports Gemini and OpenAI-compatible providers through a shared request flow.
//   AI_PROVIDER            openai | gemini | google | openrouter | anthropic | deepseek | ...
//   AI_BASE_URL            provider base URL
//   AI_API_KEY             OpenAI-style API key / Gemini bearer token
//   AI_GEMINI_API_KEY      Gemini-specific bearer token
//   AI_CHAT_MODEL          OpenAI-compatible chat model override
//   AI_EMBEDDING_MODEL     OpenAI-compatible embedding model override
//   AI_GEMINI_CHAT_MODEL   Gemini chat model override
//   AI_GEMINI_EMBEDDING_MODEL Gemini embedding model override
//   AI_GEMINI_USE_API_KEY   true to send Gemini key as `?key=...` instead of a bearer token
//   AI_METADATA_INITIAL_MODEL  lower-cost model for the first metadata pass
//   AI_METADATA_RETRY_MODEL    stronger model for metadata correction
const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";
const MODEL_RATE_LIMIT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const modelRateLimitCooldowns = new Map<string, number>();

export class ModelRateLimitError extends Error {
  readonly model: string;
  readonly cooldownUntil: number;

  constructor(model: string, cooldownUntil: number) {
    super(`Gemini model ${model} reached its model-specific rate limit; it will be skipped until ${new Date(cooldownUntil).toISOString()}.`);
    this.name = "ModelRateLimitError";
    this.model = model;
    this.cooldownUntil = cooldownUntil;
  }
}

export class ModelCoolingDownError extends Error {
  readonly model: string;
  readonly cooldownUntil: number;

  constructor(model: string, cooldownUntil: number) {
    super(`Gemini model ${model} is cooling down after a model-specific rate limit until ${new Date(cooldownUntil).toISOString()}.`);
    this.name = "ModelCoolingDownError";
    this.model = model;
    this.cooldownUntil = cooldownUntil;
  }
}

function modelCooldownKey(model: string): string {
  return `${provider()}|${base()}|${model}`;
}

export function getModelRateLimitCooldownUntil(model: string, now = Date.now()): number | null {
  const key = modelCooldownKey(model);
  const cooldownUntil = modelRateLimitCooldowns.get(key);
  if (cooldownUntil === undefined) return null;
  if (cooldownUntil <= now) {
    modelRateLimitCooldowns.delete(key);
    return null;
  }
  return cooldownUntil;
}

export function markModelRateLimited(model: string, now = Date.now()): number {
  const cooldownUntil = now + MODEL_RATE_LIMIT_COOLDOWN_MS;
  modelRateLimitCooldowns.set(modelCooldownKey(model), cooldownUntil);
  return cooldownUntil;
}

function omitCoolingDownModels(models: string[], now = Date.now()): string[] {
  return models.filter((model) => {
    const cooldownUntil = getModelRateLimitCooldownUntil(model, now);
    if (cooldownUntil === null) return true;
    console.warn("[ai] skipping model during rate-limit cooldown", {
      model,
      cooldownUntil: new Date(cooldownUntil).toISOString(),
    });
    return false;
  });
}

export function normalizeProvider(value?: string): string {
  const providerValue = (value ?? process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  const compact = providerValue.replace(/[\s_-]+/g, "");

  if (["gemini", "google", "googleai", "vertexai"].includes(compact)) {
    return "gemini";
  }

  return compact || "openai";
}

function provider() {
  return normalizeProvider();
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function arrayItem(value: unknown, index: number): unknown {
  return Array.isArray(value) ? value[index] : undefined;
}

function shouldUseGeminiKeyAsQueryParam() {
  const override = process.env.AI_GEMINI_USE_API_KEY?.toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  const key = process.env.AI_GEMINI_API_KEY ?? process.env.AI_API_KEY;
  if (!key) return false;

  return isGeminiApiKey(key);
}

function geminiUrl(path: string) {
  const url = new URL(path, base());
  if (provider() === "gemini" && shouldUseGeminiKeyAsQueryParam()) {
    const key = process.env.AI_GEMINI_API_KEY ?? process.env.AI_API_KEY;
    if (!key) throw new Error("Missing AI_GEMINI_API_KEY / AI_API_KEY for Gemini.");
    url.searchParams.set("key", key);
  }
  return url.toString();
}

function chatModel() {
  if (provider() === "gemini") {
    return process.env.AI_GEMINI_CHAT_MODEL || "gemini-3.8-flash";
  }
  return process.env.AI_CHAT_MODEL || "openai/gpt-5.5";
}

function geminiChatModels(requestedModel?: string): string[] {
  const primary = requestedModel || chatModel();
  const configuredFallbacks = process.env.AI_GEMINI_CHAT_FALLBACK_MODELS;
  const fallbacks = configuredFallbacks === undefined
    ? [
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
      ]
    : configuredFallbacks.split(",").map((model) => model.trim()).filter(Boolean);
  return Array.from(new Set([primary, ...fallbacks.filter((model) => model !== primary)]));
}

function embeddingModel() {
  if (provider() === "gemini") {
    return process.env.AI_GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
  }
  return process.env.AI_EMBEDDING_MODEL || "google/gemini-embedding-2";
}

function headers(): Record<string, string> {
  const apiKey = process.env.AI_API_KEY;
  const geminiKey = process.env.AI_GEMINI_API_KEY;
  const chosenKey = provider() === "gemini" ? geminiKey ?? apiKey : apiKey;
  const useQueryKey = provider() === "gemini" && shouldUseGeminiKeyAsQueryParam();

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

async function fetchChatWithRetry(url: string, init: RequestInit): Promise<Response> {
  const retryDelays = [3000];
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, init);
    if (![502, 503, 504].includes(response.status) || attempt >= retryDelays.length) return response;

    const retryAfterSeconds = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? Math.min(retryAfterSeconds * 1000, 10000)
      : retryDelays[attempt];
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export function buildDeterministicGenerationConfig() {
  return {
    temperature: 0,
    topP: 0.2,
    candidateCount: 1,
    maxOutputTokens: 2048,
  };
}

export function buildGeminiGenerationConfig(jsonMode = false) {
  return {
    ...buildDeterministicGenerationConfig(),
    ...(jsonMode ? { responseMimeType: "application/json" } : {}),
  };
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

export function isModelSpecificRateLimit(errorText: string): boolean {
  let error: Record<string, unknown> | null;
  try {
    error = asRecord(asRecord(JSON.parse(errorText))?.error);
  } catch {
    return false;
  }

  const details = Array.isArray(error?.details) ? error.details : [];
  const violations = details.flatMap((detail) => {
    const detailRecord = asRecord(detail);
    return Array.isArray(detailRecord?.violations) ? detailRecord.violations : [];
  });
  const quotaNames = violations.map((violation) => {
    const record = asRecord(violation);
    const quotaId = typeof record?.quotaId === "string" ? record.quotaId : "";
    const quotaMetric = typeof record?.quotaMetric === "string" ? record.quotaMetric : "";
    return `${quotaId} ${quotaMetric}`.toLowerCase().replace(/[\s_-]/g, "");
  });
  const hasModelLimit = quotaNames.some((name) => name.includes("permodel"));
  const hasProjectWideLimit = quotaNames.some((name) => name.includes("perproject") && !name.includes("permodel"));
  return hasModelLimit && !hasProjectWideLimit;
}

function isModelOverloaded(errorText: string): boolean {
  try {
    const error = asRecord(asRecord(JSON.parse(errorText))?.error);
    return error?.status === "UNAVAILABLE" &&
      typeof error.message === "string" &&
      /this model is currently experiencing high demand/i.test(error.message);
  } catch {
    return false;
  }
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

    const response = asRecord(await res.json());
    const data = Array.isArray(response?.embeddings)
      ? response.embeddings
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.responses)
      ? response.responses
      : [];

    for (const [index, item] of data.entries()) {
      const itemRecord = asRecord(item);
      const nestedEmbedding = asRecord(itemRecord?.embedding);
      const embedding = itemRecord?.values ??
        nestedEmbedding?.values ??
        itemRecord?.embedding ??
        itemRecord?.value;
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

type ChatOptions = {
  model?: string;
  allowModelFallback?: boolean;
  json_schema?: { name: string; schema: unknown };
};

export async function chatWithModel(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<{ text: string; model: string }> {
  if (provider() === "gemini") {
    const systemMessages = messages.filter((message) => message.role === "system");
    const userAndAssistant = messages.filter((message) => message.role !== "system");
    const configuredModels = opts.allowModelFallback === false
      ? [opts.model || chatModel()]
      : geminiChatModels(opts.model);
    const models = omitCoolingDownModels(configuredModels);
    if (models.length === 0) {
      const model = configuredModels[0] ?? chatModel();
      const cooldownUntil = getModelRateLimitCooldownUntil(model);
      if (cooldownUntil !== null) throw new ModelCoolingDownError(model, cooldownUntil);
      throw new Error("All configured Gemini chat models are cooling down after model-specific rate limits.");
    }

    for (let index = 0; index < models.length; index += 1) {
      const model = models[index];
      const body: Record<string, unknown> = {
        model,
        contents: userAndAssistant.map((message) => ({
          role: message.role === "assistant" ? "model" : message.role,
          parts: [{ text: message.content }],
        })),
        generationConfig: buildGeminiGenerationConfig(Boolean(opts.json_schema)),
      };

      if (systemMessages.length) {
        body.systemInstruction = {
          parts: [{ text: buildGeminiPrompt(systemMessages, opts.json_schema) }],
        };
      }

      const res = await fetchChatWithRetry(geminiUrl(`/v1beta/models/${model}:generateContent`), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const modelRateLimited = res.status === 429 && isModelSpecificRateLimit(errorText);
        const cooldownUntil = modelRateLimited ? markModelRateLimited(model) : null;
        const hasFallback = index < models.length - 1;
        const canFallback = hasFallback && (
          res.status === 404 ||
          modelRateLimited ||
          (res.status === 503 && isModelOverloaded(errorText))
        );
        if (canFallback) {
          console.warn(`[ai] model ${model} unavailable or model-rate-limited; trying ${models[index + 1]}`, {
            ...(cooldownUntil === null ? {} : { cooldownUntil: new Date(cooldownUntil).toISOString() }),
          });
          continue;
        }
        if (cooldownUntil !== null) throw new ModelRateLimitError(model, cooldownUntil);
        if (res.status === 429) throw new Error(`Gemini rate limit reached for ${model}.`);
        if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
        throw new Error(`AI request failed (${res.status}): ${errorText}`);
      }

      const response = asRecord(await res.json());
      const candidate = asRecord(arrayItem(response?.candidates, 0));
      const output = asRecord(arrayItem(response?.output, 0));
      const candidateContent = asRecord(candidate?.content ?? output?.content);
      const parts = Array.isArray(candidateContent?.parts) ? candidateContent.parts : [];
      const partsText = parts
        .map((part) => asRecord(part)?.text)
        .filter((text): text is string => typeof text === "string" && text.length > 0)
        .join(" ");
      const candidateLegacyText = asRecord(arrayItem(candidate?.content, 0))?.text;
      const outputLegacyText = asRecord(arrayItem(output?.content, 0))?.text;
      const candidateText = partsText ||
        (typeof candidateLegacyText === "string" ? candidateLegacyText : "") ||
        (typeof outputLegacyText === "string" ? outputLegacyText : "") ||
        (typeof response?.completion === "string" ? response.completion : "");
      return { text: String(candidateText), model };
    }

    throw new Error("No Gemini chat model was available.");
  }

  const model = opts.model ?? chatModel();
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0,
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
  const res = await fetchChatWithRetry(`${base()}/chat/completions`, {
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
  const response = asRecord(await res.json());
  const choices = Array.isArray(response?.choices) ? response.choices : [];
  const message = asRecord(asRecord(choices[0])?.message);
  const content = message?.content;
  if (content !== undefined && typeof content !== "string") {
    throw new Error("Unexpected chat response format.");
  }
  return { text: content ?? "", model };
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const result = await chatWithModel(messages, opts);
  return result.text;
}

export function vectorLiteral(vec: number[]): string {
  return "[" + vec.join(",") + "]";
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embed = embed;
exports.chat = chat;
exports.vectorLiteral = vectorLiteral;
// Server-only AI helpers.
// Supports OpenAI-compatible providers and Google Gemini providers.
// Defaults to the Lovable AI Gateway, but can point at any compatible backend.
//   AI_PROVIDER            openai | gemini
//   AI_BASE_URL            provider base URL
//   AI_API_KEY             OpenAI-style API key / Gemini bearer token
//   AI_GEMINI_API_KEY      Gemini-specific bearer token
//   AI_CHAT_MODEL          OpenAI-compatible chat model override
//   AI_EMBEDDING_MODEL     OpenAI-compatible embedding model override
//   AI_GEMINI_CHAT_MODEL   Gemini chat model override
//   AI_GEMINI_EMBEDDING_MODEL Gemini embedding model override
//   AI_GEMINI_USE_API_KEY   true to send Gemini key as `?key=...` instead of a bearer token
var DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";
var LOVABLE_BASE = "https://ai.gateway.lovable.dev/v1";
function provider() {
    var _a;
    return ((_a = process.env.AI_PROVIDER) !== null && _a !== void 0 ? _a : "openai").toLowerCase();
}
function base() {
    if (provider() === "gemini") {
        return process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com";
    }
    return process.env.AI_BASE_URL || DEFAULT_OPENAI_BASE;
}
function isGeminiApiKey(key) {
    return typeof key === "string" && key.startsWith("AIza");
}
function isGeminiBearerToken(key) {
    return typeof key === "string" && (key.startsWith("ya29.") || key.startsWith("AQ.") || key.startsWith("eyJ") || key.startsWith("1/"));
}
function useGeminiKeyAsQueryParam() {
    var _a, _b;
    var override = (_a = process.env.AI_GEMINI_USE_API_KEY) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (override === "true")
        return true;
    if (override === "false")
        return false;
    var key = (_b = process.env.AI_GEMINI_API_KEY) !== null && _b !== void 0 ? _b : process.env.AI_API_KEY;
    if (!key)
        return false;
    return isGeminiApiKey(key);
}
function geminiUrl(path) {
    var _a;
    var url = new URL(path, base());
    if (provider() === "gemini" && useGeminiKeyAsQueryParam()) {
        var key = (_a = process.env.AI_GEMINI_API_KEY) !== null && _a !== void 0 ? _a : process.env.AI_API_KEY;
        if (!key)
            throw new Error("Missing AI_GEMINI_API_KEY / AI_API_KEY for Gemini.");
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
function maskKey(s) {
    if (!s)
        return s;
    if (s.length <= 10)
        return s;
    return s.slice(0, 6) + "..." + s.slice(-4);
}
function headers() {
    var apiKey = process.env.AI_API_KEY;
    var geminiKey = process.env.AI_GEMINI_API_KEY;
    var lovableKey = process.env.LOVABLE_API_KEY;
    var chosenKey = provider() === "gemini" ? geminiKey !== null && geminiKey !== void 0 ? geminiKey : apiKey : apiKey;
    var useQueryKey = provider() === "gemini" && useGeminiKeyAsQueryParam();
    try {
        // eslint-disable-next-line no-console
        console.debug('[ai] provider=%s base=%s auth=%s api_key=%s lovable_key=%s', provider(), base(), provider() === "gemini" ? (useQueryKey ? "query" : "bearer") : "bearer", maskKey(chosenKey), maskKey(lovableKey));
    }
    catch (e) {
        /* ignore debug failures */
    }
    if (provider() === "gemini") {
        if (!chosenKey)
            throw new Error("Missing AI_GEMINI_API_KEY / AI_API_KEY for Gemini.");
        var headers_1 = { "Content-Type": "application/json" };
        if (!useQueryKey) {
            headers_1.Authorization = "Bearer ".concat(chosenKey);
        }
        return headers_1;
    }
    if (apiKey) {
        return {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(apiKey),
        };
    }
    if (lovableKey) {
        return {
            "Content-Type": "application/json",
            "Lovable-API-Key": lovableKey,
        };
    }
    throw new Error("Missing AI_API_KEY / LOVABLE_API_KEY");
}
function buildGeminiPrompt(messages, jsonSchema) {
    var content = messages.map(function (message) { return message.content; }).join("\n\n");
    if (!jsonSchema)
        return content;
    return "".concat(content, "\n\nReturn only valid JSON that conforms to the following schema:\n").concat(JSON.stringify(jsonSchema.schema, null, 2), "\n\nDo not include any extra text.");
}
function embed(inputs) {
    return __awaiter(this, void 0, void 0, function () {
        var out, _loop_1, i;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    out = new Array(inputs.length);
                    _loop_1 = function (i) {
                        var batch, res, modelName_1, body, _f, _g, _h, j, data, _i, _j, _k, index, item, embedding;
                        return __generator(this, function (_l) {
                            switch (_l.label) {
                                case 0:
                                    batch = inputs.slice(i, i + 100);
                                    res = void 0;
                                    if (!(provider() === "gemini")) return [3 /*break*/, 2];
                                    modelName_1 = "models/".concat(embeddingModel());
                                    body = {
                                        requests: batch.map(function (text) { return ({
                                            model: modelName_1,
                                            content: { role: "user", parts: [{ text: text }] },
                                        }); }),
                                    };
                                    return [4 /*yield*/, fetch(geminiUrl("/v1beta/".concat(modelName_1, ":batchEmbedContents")), {
                                            method: "POST",
                                            headers: headers(),
                                            body: JSON.stringify(body),
                                        })];
                                case 1:
                                    res = _l.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, fetch("".concat(base(), "/embeddings"), {
                                        method: "POST",
                                        headers: headers(),
                                        body: JSON.stringify({ model: embeddingModel(), input: batch }),
                                    })];
                                case 3:
                                    res = _l.sent();
                                    _l.label = 4;
                                case 4:
                                    if (!!res.ok) return [3 /*break*/, 6];
                                    _f = Error.bind;
                                    _h = (_g = "Embedding failed (".concat(res.status, "): ")).concat;
                                    return [4 /*yield*/, res.text()];
                                case 5: throw new (_f.apply(Error, [void 0, _h.apply(_g, [_l.sent()])]))();
                                case 6: return [4 /*yield*/, res.json()];
                                case 7:
                                    j = _l.sent();
                                    data = Array.isArray(j.embeddings)
                                        ? j.embeddings
                                        : Array.isArray(j.data)
                                            ? j.data
                                            : Array.isArray(j.responses)
                                                ? j.responses
                                                : [];
                                    for (_i = 0, _j = data.entries(); _i < _j.length; _i++) {
                                        _k = _j[_i], index = _k[0], item = _k[1];
                                        embedding = (_d = (_c = (_a = item.values) !== null && _a !== void 0 ? _a : (_b = item.embedding) === null || _b === void 0 ? void 0 : _b.values) !== null && _c !== void 0 ? _c : item.embedding) !== null && _d !== void 0 ? _d : item.value;
                                        if (!embedding || !Array.isArray(embedding)) {
                                            throw new Error("Unexpected embedding response format.");
                                        }
                                        out[i + index] = embedding;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _e.label = 1;
                case 1:
                    if (!(i < inputs.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    i += 100;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, out];
            }
        });
    });
}
function chat(messages_1) {
    return __awaiter(this, arguments, void 0, function (messages, opts) {
        var model, systemMessages, userAndAssistant, body_1, res_1, text, j_1, candidateContent, candidateText, body, res, text, j;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        if (opts === void 0) { opts = {}; }
        return __generator(this, function (_w) {
            switch (_w.label) {
                case 0:
                    if (!(provider() === "gemini")) return [3 /*break*/, 5];
                    model = (_a = opts.model) !== null && _a !== void 0 ? _a : chatModel();
                    systemMessages = messages.filter(function (message) { return message.role === "system"; });
                    userAndAssistant = messages.filter(function (message) { return message.role !== "system"; });
                    body_1 = {
                        model: model,
                        contents: userAndAssistant.map(function (message) { return ({
                            role: message.role === "assistant" ? "model" : message.role,
                            parts: [{ text: message.content }],
                        }); }),
                    };
                    if (systemMessages.length) {
                        body_1.systemInstruction = {
                            parts: [{ text: buildGeminiPrompt(systemMessages, opts.json_schema) }],
                        };
                    }
                    return [4 /*yield*/, fetch(geminiUrl("/v1beta/models/".concat(model, ":generateContent")), {
                            method: "POST",
                            headers: headers(),
                            body: JSON.stringify(body_1),
                        })];
                case 1:
                    res_1 = _w.sent();
                    if (!!res_1.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res_1.text()];
                case 2:
                    text = _w.sent();
                    if (res_1.status === 429)
                        throw new Error("Rate limit reached. Please try again shortly.");
                    if (res_1.status === 402)
                        throw new Error("AI credits exhausted. Please add credits to continue.");
                    throw new Error("AI request failed (".concat(res_1.status, "): ").concat(text));
                case 3: return [4 /*yield*/, res_1.json()];
                case 4:
                    j_1 = _w.sent();
                    candidateContent = (_g = (_d = (_c = (_b = j_1.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : (_f = (_e = j_1.output) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) !== null && _g !== void 0 ? _g : undefined;
                    candidateText = ((_h = candidateContent === null || candidateContent === void 0 ? void 0 : candidateContent.parts) === null || _h === void 0 ? void 0 : _h.map(function (part) { return part.text; }).filter(Boolean).join(" ")) ||
                        ((_m = (_l = (_k = (_j = j_1.candidates) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.content) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.text) ||
                        ((_r = (_q = (_p = (_o = j_1.output) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.content) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.text) ||
                        j_1.completion ||
                        "";
                    return [2 /*return*/, String(candidateText)];
                case 5:
                    body = {
                        model: (_s = opts.model) !== null && _s !== void 0 ? _s : chatModel(),
                        messages: messages,
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
                    return [4 /*yield*/, fetch("".concat(base(), "/chat/completions"), {
                            method: "POST",
                            headers: headers(),
                            body: JSON.stringify(body),
                        })];
                case 6:
                    res = _w.sent();
                    if (!!res.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, res.text()];
                case 7:
                    text = _w.sent();
                    if (res.status === 429)
                        throw new Error("Rate limit reached. Please try again shortly.");
                    if (res.status === 402)
                        throw new Error("AI credits exhausted. Please add credits to continue.");
                    throw new Error("AI request failed (".concat(res.status, "): ").concat(text));
                case 8: return [4 /*yield*/, res.json()];
                case 9:
                    j = (_w.sent());
                    return [2 /*return*/, (_v = (_u = (_t = j.choices[0]) === null || _t === void 0 ? void 0 : _t.message) === null || _u === void 0 ? void 0 : _u.content) !== null && _v !== void 0 ? _v : ""];
            }
        });
    });
}
function vectorLiteral(vec) {
    return "[" + vec.join(",") + "]";
}

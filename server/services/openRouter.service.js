import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Provider implementations ─────────────────────────────────────────────────

/**
 * Call OpenRouter. Returns content string or throws.
 */
async function callOpenRouter(messages, attempt = 1) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openrouter/auto",   // auto picks best available free model
      messages,
      max_tokens: 3000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15s — if no response by then, switch to Google
    }
  );

  const content = response.data.choices[0]?.message?.content;
  if (!content || content.trim() === "") throw new Error("Empty response from OpenRouter");

  const usedModel = response.data.model ?? "openrouter/auto";
  console.log(`✅ [OpenRouter] attempt ${attempt} — model: ${usedModel}`);
  return content;
}

/**
 * Call Google Gemini. Returns content string or throws.
 * Converts the OpenAI-style messages array into Gemini's format automatically.
 */
async function callGoogle(messages) {
  const genAI  = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // fast + free tier

  // Extract system prompt (Gemini handles it via systemInstruction)
  const systemMsg = messages.find((m) => m.role === "system");
  const userMsgs  = messages.filter((m) => m.role !== "system");

  // Build Gemini-style history from all but the last user message
  const history = userMsgs.slice(0, -1).map((m) => ({
    role:  m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastUserMsg = userMsgs.at(-1)?.content ?? "";

  const chat = model.startChat({
    ...(systemMsg ? { systemInstruction: systemMsg.content } : {}),
    history,
  });

  const result  = await chat.sendMessage(lastUserMsg);
  const content = result.response.text();

  if (!content || content.trim() === "") throw new Error("Empty response from Google AI");

  console.log("✅ [Google Gemini] gemini-1.5-flash");
  return content;
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Try OpenRouter first (up to 2 attempts), then auto-fallback to Google Gemini.
 * If both fail, throws so the caller can return a 500.
 *
 * Priority:
 *   1. OpenRouter attempt 1
 *   2. OpenRouter attempt 2  (if attempt 1 gave empty/timeout)
 *   3. Google Gemini          (if both OpenRouter attempts failed)
 *   4. throw                  (if Google also fails)
 */
export const askAI = async (messages) => {
  if (!messages || messages.length === 0) {
    throw new Error("Messages are required");
  }

  const OPENROUTER_ATTEMPTS = 3;

  // ── Phase 1: OpenRouter ──────────────────────────────────────────────────
  for (let attempt = 1; attempt <= OPENROUTER_ATTEMPTS; attempt++) {
    try {
      return await callOpenRouter(messages, attempt);
    } catch (err) {
      const reason = err.response?.data?.error?.message ?? err.message;
      console.warn(`⚠️  [OpenRouter] attempt ${attempt} failed: ${reason}`);

      // On rate-limit (429) or auth error (401/403) don't waste another attempt
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        console.error("❌ [OpenRouter] auth error — skipping remaining attempts");
        break;
      }
      if (status === 429) {
        console.warn("⚠️  [OpenRouter] rate limited — switching to Google AI");
        break;
      }
    }
  }

  // ── Phase 2: Google Gemini fallback ──────────────────────────────────────
  console.log("🔄 Falling back to Google AI...");
  try {
    return await callGoogle(messages);
  } catch (err) {
    const reason = err.message ?? "unknown error";
    console.error(`❌ [Google AI] failed: ${reason}`);
    throw new Error("All AI providers failed. Please try again later.");
  }
};
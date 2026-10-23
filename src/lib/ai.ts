/**
 * Xenvra AI Completion Service
 * Supports Groq (ultra-fast inference) and OpenAI models with graceful heuristic fallback.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateAiCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string | null> {
  const groqKey =
    process.env.GROQ_API_KEY ||
    (process.env.OPENAI_API_KEY?.startsWith("gsk_")
      ? process.env.OPENAI_API_KEY
      : undefined);

  // 1. Try Groq (Llama / GPT-OSS on Groq)
  if (groqKey) {
    try {
      const model = options?.model || process.env.LLM_MODEL || "openai/gpt-oss-120b";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn("Groq inference error:", err);
    }
  }

  // 2. Try Standard OpenAI
  const openAiKey =
    process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("gsk_")
      ? process.env.OPENAI_API_KEY
      : undefined;

  if (openAiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn("OpenAI inference error:", err);
    }
  }

  return null;
}

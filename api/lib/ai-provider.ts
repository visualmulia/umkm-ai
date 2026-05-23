// AI Provider — Fleksibel: Groq atau Kimi

export type AIProvider = "groq" | "kimi";

export function getAIProvider(): AIProvider {
  // @ts-ignore
  return (process?.env?.AI_PROVIDER as AIProvider) || "groq";
}

export interface AIResponse {
  content: string;
  confidence: number;
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const provider = getAIProvider();

  if (provider === "kimi") {
    return callKimi(systemPrompt, userPrompt);
  }

  return callGroq(systemPrompt, userPrompt);
}

// Groq — default, gratis, gampang daftar
async function callGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // @ts-ignore
  const apiKey = process?.env?.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Groq API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  return { content, confidence: 0.85 };
}

// Kimi — backup option
async function callKimi(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // @ts-ignore
  const apiKey = process?.env?.KIMI_API_KEY;
  if (!apiKey) {
    throw new Error("KIMI_API_KEY not configured");
  }

  const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "kimi-k2.5-lite-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kimi API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  return { content, confidence: 0.85 };
}
/**
 * AI 클라이언트
 * - LLM 생성: Anthropic (Claude)
 * - 임베딩: Jina AI (768 차원)
 */

import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// Jina AI 임베딩 (768 차원)
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v2-base-en",
      input: [text],
    }),
  });

  if (!response.ok) {
    throw new Error(`Jina API 오류: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

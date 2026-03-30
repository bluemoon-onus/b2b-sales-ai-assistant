/**
 * AI 클라이언트
 * - LLM 생성: Anthropic (Claude) / OpenAI (파인튜닝)
 * - 임베딩: Jina AI (768 차원)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 빌드 시 키 미존재 에러 방지 — 런타임에만 초기화
export function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
export const OPENAI_FINETUNED_MODEL = process.env.OPENAI_FINETUNED_MODEL ?? "gpt-4o-mini-2024-07-18";

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

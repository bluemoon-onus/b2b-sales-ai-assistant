/**
 * 유사도 검색 테스트 스크립트
 * 실행: npx ts-node --esm scripts/test-search.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Jina AI로 쿼리 임베딩 생성
async function createEmbedding(text: string): Promise<number[]> {
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
  const data = await response.json();
  return data.data[0].embedding;
}

// 유사도 검색 실행
async function search(query: string, threshold = 0.5) {
  console.log(`\n🔍 쿼리: "${query}"`);
  console.log("─".repeat(60));

  const embedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: 3,
  });

  if (error) {
    console.error("❌ 검색 오류:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("결과 없음 (threshold를 낮춰보세요)");
    return;
  }

  data.forEach((doc: any, i: number) => {
    console.log(`\n[${i + 1}] 유사도: ${(doc.similarity * 100).toFixed(1)}%  타입: ${doc.metadata.type}`);
    console.log(doc.content.slice(0, 200) + (doc.content.length > 200 ? "..." : ""));
  });
}

async function main() {
  console.log("🧪 유사도 검색 테스트 시작\n");

  // 테스트 쿼리 3가지
  await search("CRM 연동 가능한가요?");
  await search("제조업 고객 성공 사례");
  await search("가격이 너무 비싸요 예산이 없어요");

  console.log("\n\n✅ 테스트 완료");
}

main().catch(console.error);

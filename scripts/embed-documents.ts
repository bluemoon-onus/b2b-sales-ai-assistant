/**
 * 제품 자료를 임베딩해서 Supabase에 저장하는 스크립트
 * 임베딩: Jina AI (무료, jina-embeddings-v2-base-en, 768 dims)
 * 실행: npm run embed
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Jina AI 임베딩 생성 (768 차원)
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Jina API 오류: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// 텍스트를 단락 단위로 청크 분할
function splitIntoChunks(text: string, maxLength = 800): string[] {
  const chunks: string[] = [];
  const sections = text.split(/\n---\n|\n(?=### )/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLength) {
      chunks.push(trimmed);
    } else {
      const paragraphs = trimmed.split("\n\n");
      let current = "";
      for (const para of paragraphs) {
        if ((current + para).length > maxLength && current) {
          chunks.push(current.trim());
          current = para;
        } else {
          current += (current ? "\n\n" : "") + para;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }
  return chunks;
}

// 파일 처리 및 Supabase 저장
async function processFile(
  filePath: string,
  docType: "faq" | "script" | "case"
) {
  const text = fs.readFileSync(filePath, "utf-8");
  const chunks = splitIntoChunks(text);

  console.log(`\n[${docType}] ${path.basename(filePath)} — ${chunks.length}개 청크 처리 중...`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`  청크 ${i + 1}/${chunks.length}: ${chunk.slice(0, 50)}...`);

    const embedding = await createEmbedding(chunk);

    const { error } = await supabase.from("documents").insert({
      content: chunk,
      embedding,
      metadata: { type: docType, source: path.basename(filePath), chunk_index: i },
    });

    if (error) {
      console.error(`  ❌ 저장 실패:`, error.message);
    } else {
      console.log(`  ✅ 저장 완료`);
    }

    // 레이트 리밋 방지
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function main() {
  console.log("🚀 문서 임베딩 시작 (Jina AI)...\n");

  const docsDir = path.join(process.cwd(), "data/documents");

  await processFile(path.join(docsDir, "faq.txt"), "faq");
  await processFile(path.join(docsDir, "scripts.txt"), "script");
  await processFile(path.join(docsDir, "cases.txt"), "case");

  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  console.log(`\n✅ 완료! 총 ${count}개 청크가 Supabase에 저장되었습니다.`);
}

main().catch(console.error);

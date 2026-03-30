/**
 * OpenAI 파인튜닝 실행 스크립트
 * 실행: npx ts-node --esm scripts/finetune.ts
 */

import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  // 1. 학습 데이터 파일 업로드
  console.log("📤 학습 데이터 업로드 중...");
  const filePath = path.join(process.cwd(), "data", "training.jsonl");
  const fileStream = fs.createReadStream(filePath);

  const uploadedFile = await openai.files.create({
    file: fileStream,
    purpose: "fine-tune",
  });
  console.log(`✅ 파일 업로드 완료: ${uploadedFile.id}`);

  // 2. 파인튜닝 잡 생성
  console.log("\n🚀 파인튜닝 잡 생성 중...");
  const job = await openai.fineTuning.jobs.create({
    training_file: uploadedFile.id,
    model: "gpt-4o-mini-2024-07-18",
  });

  console.log(`✅ 파인튜닝 잡 생성 완료`);
  console.log(`   Job ID: ${job.id}`);
  console.log(`   상태: ${job.status}`);
  console.log(`\n⏳ 학습에 20~60분 소요됩니다.`);
  console.log(`   완료되면 OpenAI 대시보드에서 모델 ID를 확인하세요:`);
  console.log(`   https://platform.openai.com/finetune`);
  console.log(`\n   모델 ID를 .env.local에 추가하세요:`);
  console.log(`   OPENAI_FINETUNED_MODEL=ft:gpt-4o-mini-2024-07-18:...\n`);

  // 3. 잡 상태 폴링 (최대 5분 대기)
  console.log("📊 상태 확인 중 (5분 대기 후 종료)...");
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 30000));
    const current = await openai.fineTuning.jobs.retrieve(job.id);
    console.log(`   [${new Date().toLocaleTimeString()}] 상태: ${current.status}`);
    if (current.status === "succeeded") {
      console.log(`\n🎉 파인튜닝 완료!`);
      console.log(`   모델 ID: ${current.fine_tuned_model}`);
      console.log(`\n   .env.local에 추가:`);
      console.log(`   OPENAI_FINETUNED_MODEL=${current.fine_tuned_model}`);
      return;
    }
    if (current.status === "failed") {
      console.error(`\n❌ 파인튜닝 실패:`, current);
      return;
    }
  }
  console.log("\n⏰ 5분 초과 — 백그라운드에서 계속 진행 중입니다.");
  console.log(`   Job ID: ${job.id} 로 상태를 나중에 확인하세요.`);
}

main().catch(console.error);

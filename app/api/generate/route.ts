import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  anthropic,
  getOpenAI,
  createEmbedding,
  CLAUDE_MODEL,
  OPENAI_FINETUNED_MODEL,
} from "@/lib/ai";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT_KO = `당신은 B2B SaaS 기업의 시니어 영업 담당자입니다.
고객 정보와 제품 자료를 바탕으로 개인화된 영업 이메일 초안을 작성하세요.

[작성 원칙]
- 첫 문장부터 고객의 업종/니즈에 맞는 공감으로 시작
- 제품 자료(FAQ, 사례, 스크립트)의 구체적인 수치와 사례를 활용
- 과도한 홍보 문구 없이 자연스럽고 신뢰감 있는 톤 유지
- 이메일 제목 포함, 본문은 200~300자 내외로 간결하게
- 마지막엔 명확한 CTA(콜투액션) 한 줄로 마무리
- 한국어로 작성`;

const SYSTEM_PROMPT_EN = `You are a senior sales representative at a B2B SaaS company.
Write a personalized sales email draft based on the customer information and product materials provided.

[Writing Guidelines]
- Open with empathy tailored to the customer's industry and needs from the very first sentence
- Use specific numbers and case studies from the product materials (FAQ, case studies, scripts)
- Maintain a natural, trustworthy tone without excessive promotional language
- Include a subject line; keep the body concise (50–80 words)
- End with a single, clear CTA (call to action)
- Write in English`;

// RAG: Supabase에서 관련 문서 검색
async function searchDocuments(query: string) {
  const embedding = await createEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 3,
  });

  if (error) throw new Error(`RAG 검색 실패: ${error.message}`);
  return data ?? [];
}

// RAG 결과를 프롬프트용 텍스트로 변환
function formatContext(docs: { content: string; metadata: { type: string } }[]) {
  if (docs.length === 0) return "관련 자료 없음";
  return docs
    .map((d) => `[${d.metadata.type.toUpperCase()}]\n${d.content}`)
    .join("\n\n---\n\n");
}

function buildUserPrompt(company: string, industry: string, needs: string, context: string, lang: string, keywords?: string) {
  if (lang === "en") {
    return `[Customer Information]
Company: ${company}
Industry: ${industry}
Email Type: ${needs}${keywords ? `\nAdditional Notes: ${keywords}` : ""}

[Reference Product Materials (RAG Results)]
${context}

Please write a sales email draft based on the above information.`;
  }
  return `[고객 정보]
회사명: ${company}
업종: ${industry}
초안 유형: ${needs}${keywords ? `\n추가 내용: ${keywords}` : ""}

[참고 제품 자료 (RAG 검색 결과)]
${context}

위 정보를 바탕으로 영업 이메일 초안을 작성해주세요.`;
}

export async function POST(req: NextRequest) {
  try {
    const { company, industry, needs, keywords, mode, lang } = await req.json();

    if (!company || !industry || !needs) {
      return NextResponse.json(
        { error: "company, industry, needs 값이 필요합니다." },
        { status: 400 }
      );
    }

    // 1. RAG 검색 (공통)
    const query = `${industry} ${needs}`;
    const docs = await searchDocuments(query);
    const context = formatContext(docs);
    const systemPrompt = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_KO;
    const userPrompt = buildUserPrompt(company, industry, needs, context, lang ?? "ko", keywords);

    let email: string | null = null;

    if (mode === "openai") {
      // 2a. OpenAI 파인튜닝 모델
      const completion = await getOpenAI().chat.completions.create({
        model: OPENAI_FINETUNED_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      email = completion.choices[0].message.content;
    } else {
      // 2b. Claude (기본)
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      email =
        message.content[0].type === "text" ? message.content[0].text : null;
    }

    if (!email) throw new Error("이메일 생성 실패");

    return NextResponse.json({
      email,
      sources: docs.map((d: { content: string; metadata: { type: string } }) => ({
        type: d.metadata.type,
        preview: d.content.slice(0, 80),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

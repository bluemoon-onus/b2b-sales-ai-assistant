# 시스템 아키텍처

## 전체 흐름

```
┌─────────────────────────────────────────────────────┐
│                    사용자 (브라우저)                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  입력 폼                                     │   │
│  │  - 고객사명                                  │   │
│  │  - 업종 (제조/IT/금융/유통 등)               │   │
│  │  - 핵심 니즈/페인포인트                      │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │ POST /api/generate             │
│  ┌──────────────────▼──────────────────────────┐   │
│  │  이메일 출력 영역                             │   │
│  │  - 생성된 영업 이메일 초안                   │   │
│  │  - 복사 버튼                                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                    Next.js API
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐     ┌──────────────────────────────┐
│   Supabase    │     │  임베딩: Jina AI (무료)        │
│   pgvector    │     │  jina-embeddings-v2-base-en   │
│               │     │  768 차원                     │
│  documents    │◄────┤                              │
│  table        │     │  생성: OpenRouter (무료)       │
│               │     │  google/gemma-3-27b-it:free  │
│  similarity   │─────►  + 상세 시스템 프롬프트        │
│  search       │     │  (파인튜닝 대체)               │
└───────────────┘     └──────────────────────────────┘
```

## API Route 상세: `/api/generate`

```
입력: { company, industry, needs }
  │
  ├─ 1. 쿼리 임베딩 생성
  │      text-embedding-3-small("industry + needs")
  │
  ├─ 2. RAG 검색 (Supabase)
  │      match_documents(embedding, threshold=0.7, limit=3)
  │      → 관련 제품 자료 3개 반환
  │
  ├─ 3. 프롬프트 구성
  │      system: 파인튜닝 학습된 톤앤매너
  │      user: 고객 정보 + RAG 컨텍스트
  │
  └─ 4. 파인튜닝 모델 호출
         ft:gpt-4o-mini-XXXX
         → 영업 이메일 초안 반환
```

## 디렉토리 구조 (예정)

```
b2b-sales-ai-assistant/
├── app/
│   ├── page.tsx              # 메인 UI
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # 이메일 생성 API
│   └── layout.tsx
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   └── openai.ts             # OpenAI 클라이언트
├── scripts/
│   └── embed-documents.ts    # 문서 임베딩 스크립트
├── data/
│   ├── documents/            # RAG용 원본 텍스트
│   │   ├── faq.txt
│   │   ├── scripts.txt
│   │   └── cases.txt
│   └── training.jsonl        # 파인튜닝용 학습 데이터
├── docs/
│   ├── requirements.md
│   ├── changelog.md
│   ├── todo.md
│   └── architecture.md
├── .env.local                # 환경변수 (gitignore)
├── .env.example              # 환경변수 템플릿
└── README.md
```

## 환경변수

```bash
# OpenRouter (LLM 생성)
OPENROUTER_API_KEY=sk-or-...

# Jina AI (임베딩, 무료)
JINA_API_KEY=jina_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # 서버 전용

NEXT_PUBLIC_SITE_URL=http://localhost:3000   # 배포 후 실제 URL로 변경
```

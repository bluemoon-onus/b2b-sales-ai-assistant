# B2B Sales AI Assistant — 프로젝트 요약

## 1. 프로젝트 개요 및 의의

B2B SaaS 영업 담당자가 고객사 정보(회사명, 업종, 니즈)를 입력하면 개인화된 영업 이메일 초안을 자동 생성해주는 AI 어시스턴트입니다.

**의의**:
- 포트폴리오 목적으로, **RAG(Retrieval-Augmented Generation)** 와 **OpenAI Fine-tuning** 을 실제 프로덕션 수준에서 구현한 사례
- 단순 ChatGPT 래핑이 아닌, 사내 자료(FAQ / 영업 스크립트 / 고객 성공 사례)를 벡터 DB에 인덱싱하여 맥락 기반 이메일을 생성
- 회사 톤앤매너를 학습한 파인튜닝 모델과 Claude RAG 모델을 나란히 비교 가능한 듀얼 모드 구조로, AI 도입 의사결정자에게 기술 차이를 직관적으로 시연 가능

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 16 (App Router, React 19) |
| 언어 | TypeScript (Strict mode) |
| 스타일 | Tailwind CSS |
| LLM — RAG 모드 | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| LLM — 파인튜닝 모드 | OpenAI GPT-4o-mini (fine-tuned: `ft:gpt-4o-mini-2024-07-18:personal::DP2M518h`) |
| 임베딩 | Jina AI (`jina-embeddings-v2-base-en`, 768차원) |
| 벡터 DB | Supabase pgvector (코사인 유사도, IVFFLAT 인덱스) |
| 배포/분석 | Vercel + Vercel Analytics |

---

## 3. AI 기능 및 컨셉

### RAG (Retrieval-Augmented Generation)
1. 사용자 입력(`업종 + 이메일 유형`)을 Jina AI로 임베딩
2. Supabase pgvector에서 코사인 유사도 0.5 이상의 상위 3개 문서 검색
3. 검색된 사내 자료(FAQ / 스크립트 / 사례)를 컨텍스트로 LLM에 전달
4. LLM이 실제 제품 정보를 근거로 한 이메일 생성

**효과**: 할루시네이션 감소, 실제 제품 수치 및 사례 기반 문구 생성

### Fine-tuning (OpenAI)
- `data/training.jsonl` (시스템/유저/어시스턴트 형식의 31KB 학습 데이터)를 `gpt-4o-mini-2024-07-18`에 파인튜닝
- 회사 특유의 톤앤매너, 이메일 구조, 표현 방식을 모델이 내재화
- RAG 컨텍스트와 결합하여 내용 정확성 + 문체 일관성을 동시에 확보

### 듀얼 모드 비교
| | Claude + RAG | OpenAI + RAG + Fine-tuning |
|---|---|---|
| 강점 | 빠른 응답, 유연한 프롬프팅 | 학습된 톤앤매너, 문체 일관성 |
| 모델 | Claude Haiku | Fine-tuned GPT-4o-mini |
| 공통 | Jina 임베딩 + Supabase RAG |

---

## 4. 하이레벨 디렉토리 구조

```
b2b-sales-ai-assistant/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 메인 UI (한/영 이중 언어, 듀얼 모드 토글)
│   ├── layout.tsx              # 루트 레이아웃 (Vercel Analytics 포함)
│   ├── globals.css             # Tailwind 글로벌 스타일
│   └── api/generate/
│       └── route.ts            # 이메일 생성 API (RAG → LLM 오케스트레이션)
├── lib/
│   ├── ai.ts                   # Anthropic / OpenAI 클라이언트, Jina 임베딩 유틸
│   └── supabase.ts             # Supabase 클라이언트 (public / admin)
├── scripts/
│   ├── embed-documents.ts      # 문서 청킹 → Jina 임베딩 → Supabase 업로드
│   ├── finetune.ts             # OpenAI 파인튜닝 잡 제출 및 상태 폴링
│   └── test-search.ts          # 벡터 유사도 검색 테스트
├── data/
│   ├── documents/
│   │   ├── faq.txt             # 제품 FAQ 10개
│   │   ├── scripts.txt         # 영업 스크립트
│   │   └── cases.txt           # 고객 성공 사례 5개
│   └── training.jsonl          # 파인튜닝 학습 데이터 (31KB)
├── supabase/
│   └── setup.sql               # pgvector 테이블 및 match_documents RPC 함수
├── docs/                       # 프로젝트 문서
│   ├── requirements.md         # PRD 및 유저 스토리
│   ├── architecture.md         # 시스템 설계 및 데이터 플로우
│   ├── changelog.md            # 릴리즈 노트
│   ├── todo.md                 # 개발 체크리스트
│   └── summary.md              # 이 파일
├── .env.local                  # API 키 (gitignore)
├── .env.example                # 환경 변수 템플릿
└── package.json
```

---

## 5. 주요 변경 이력

| 커밋 | 내용 |
|------|------|
| `a0a071a` | Create Next App 초기 세팅 |
| `953876e` | **MVP 구현**: 메인 UI, `/api/generate` 엔드포인트, RAG 파이프라인 (Claude 단일 모드) |
| `226ffc8` | TypeScript 타입 오류 수정 (`docs.map` 콜백 명시적 타입 추가) |
| `5158795` | **OpenAI 파인튜닝 모드 추가**: 듀얼 모드 토글 UI, 파인튜닝 모델 분기 처리 |
| `af41390` | OpenAI 클라이언트 빌드타임 크레덴셜 오류 수정 (Lazy initialization) |
| `e1c634d` | **키워드 입력 필드 추가**: 추가 메모/키워드를 프롬프트에 반영 |
| `30864b2` | UI 개선: 헤더 타이틀 변경, 폰트 1.5배 스케일 |
| `2b54e25` | Vercel Analytics 연동 |

---

## 6. 데이터 플로우 요약

```
[사용자 입력]
 회사명 / 업종 / 이메일 유형 / 키워드 (선택)
        ↓
[POST /api/generate]
  1. 쿼리 임베딩 생성 (Jina AI, 768차원)
  2. Supabase pgvector 유사도 검색 (threshold 0.5, top 3)
  3. 검색 결과를 컨텍스트로 프롬프트 구성
  4. LLM 호출 (Claude Haiku 또는 Fine-tuned GPT-4o-mini)
        ↓
[응답]
  생성된 이메일 본문 + 참조된 사내 문서 목록
```

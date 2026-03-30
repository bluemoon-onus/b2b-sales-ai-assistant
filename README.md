# B2B Sales AI Assistant

B2B SaaS 영업 담당자를 위한 AI 이메일 초안 생성기.
고객 정보를 입력하면 **RAG**(제품 자료 검색) + **파인튜닝 모델**(회사 톤앤매너)이 결합되어 개인화된 영업 이메일을 자동 생성합니다.

---

## 주요 기능

- 고객사명, 업종, 핵심 니즈 입력 → 영업 이메일 초안 즉시 생성
- RAG: Supabase pgvector로 관련 제품 자료 자동 검색 및 주입
- 파인튜닝: 회사 고유의 톤앤매너로 학습된 gpt-4o-mini 모델 사용

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js (App Router) |
| Backend | Next.js API Routes |
| LLM | OpenAI gpt-4o-mini (파인튜닝) |
| 임베딩 | text-embedding-3-small |
| 벡터 DB | Supabase pgvector |
| 배포 | Vercel |

## 아키텍처

```
입력 (고객사/업종/니즈)
    ↓
RAG 검색 (Supabase pgvector)     ← 제품 FAQ, 영업 스크립트, 고객 사례
    ↓
파인튜닝 모델 (gpt-4o-mini)      ← 회사 톤앤매너 학습
    ↓
영업 이메일 초안 출력
```

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 API 키 입력

# 개발 서버 실행
npm run dev
```

## 문서

- [요구사항 분석](docs/requirements.md)
- [시스템 아키텍처](docs/architecture.md)
- [할일 목록](docs/todo.md)
- [변경 이력](docs/changelog.md)

---

> 포트폴리오 프로젝트 — B2B SaaS 세일즈 직군 지원용

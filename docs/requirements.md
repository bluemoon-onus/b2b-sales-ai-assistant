# 요구사항 분석 — B2B Sales AI Assistant

## 1. 프로젝트 개요

B2B SaaS 영업 담당자가 고객 정보를 입력하면, 제품 자료(RAG)를 검색해 파인튜닝 모델이 회사 톤앤매너에 맞는 영업 이메일 초안을 자동 생성하는 AI 어시스턴트.

**목적**: B2B SaaS 세일즈 직군 포트폴리오용 — RAG + 파인튜닝을 실제 서비스로 구현

---

## 2. 사용자 스토리

| # | As a... | I want to... | So that... |
|---|---------|-------------|------------|
| 1 | 영업 담당자 | 고객사 이름, 업종, 니즈를 입력하면 | 빠르게 개인화된 영업 이메일 초안을 받을 수 있다 |
| 2 | 영업 담당자 | 생성된 이메일을 즉시 복사하거나 수정할 수 있어야 | 실무에서 바로 활용할 수 있다 |
| 3 | 영업 담당자 | 제품 FAQ, 스펙, 사례 정보가 이메일에 자동 반영되어 | 직접 자료를 찾는 시간을 줄일 수 있다 |

---

## 3. 핵심 기능 (MVP)

### Phase 1 — 벡터 DB 세팅 (Day 1~2)
- Supabase pgvector 테이블 생성
- 제품 자료(FAQ, 스크립트, 사례) 임베딩 후 저장
- 유사도 검색 API 동작 확인

### Phase 2 — 파인튜닝 (Day 3~4)
- 영업 이메일 예시 30~50개 JSONL 작성
- OpenAI gpt-4o-mini 파인튜닝 실행
- 파인튜닝 모델 응답 품질 검증

### Phase 3 — UI + 파이프라인 연결 (Day 5~6)
- v0로 Next.js UI 생성
- 입력 → RAG 검색 → 파인튜닝 모델 → 이메일 출력 파이프라인
- API Route 연결

### Phase 4 — 배포 (Day 7)
- GitHub 레포 정리 + README 작성
- Vercel 배포
- 포트폴리오 URL 확보

---

## 4. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | Next.js (App Router) | Vercel v0로 생성 |
| 백엔드 | Next.js API Routes | 동일 레포 |
| LLM | OpenAI gpt-4o-mini | 파인튜닝 적용 |
| 임베딩 | text-embedding-3-small | 1536 차원 |
| 벡터 DB | Supabase pgvector | 무료 플랜 |
| 배포 | Vercel + GitHub | 자동 CD |

---

## 5. RAG vs 파인튜닝 역할 분리

```
[사용자 입력]
    고객사: ABC Corp (제조업)
    니즈: 영업팀 생산성 향상
         ↓
[RAG — "무엇을 말할지"]
    Supabase에서 관련 문서 검색
    - 제조업 고객 성공 사례
    - 관련 제품 기능 스펙
    - 자주 묻는 질문
         ↓
[파인튜닝 모델 — "어떻게 말할지"]
    gpt-4o-mini (학습된 톤앤매너)
    + RAG 컨텍스트 주입
         ↓
[출력]
    회사 스타일로 작성된 영업 이메일 초안
```

---

## 6. 데이터 구조

### Supabase 테이블: `documents`
```sql
id          uuid primary key
content     text           -- 원본 텍스트
embedding   vector(1536)   -- text-embedding-3-small
metadata    jsonb          -- { type: 'faq'|'script'|'case', topic: string }
created_at  timestamptz
```

### 파인튜닝 JSONL 포맷
```jsonb
{"messages": [
  {"role": "system", "content": "당신은 B2B SaaS 영업 전문가입니다..."},
  {"role": "user", "content": "고객사: ..., 니즈: ..."},
  {"role": "assistant", "content": "안녕하세요 ..."}
]}
```

---

## 7. 비기능 요구사항

- 응답 시간: 5초 이내 (RAG 검색 + LLM 생성 합산)
- 비용: OpenAI API 월 $10 이하 (개인 포트폴리오 수준)
- 접근성: Vercel 무료 플랜으로 공개 URL 제공

---

## 8. 사전 준비 체크리스트

- [ ] OpenAI API 키 발급 및 환경변수 설정
- [ ] Supabase 프로젝트 생성 + pgvector 익스텐션 활성화
- [ ] Vercel 계정 + GitHub 연동
- [ ] GitHub 레포 생성 (`b2b-sales-ai-assistant`)

# 변경 이력 (Changelog)

## [Unreleased]

### 계획된 작업
- Supabase pgvector 세팅
- 문서 임베딩 파이프라인
- 파인튜닝 JSONL 데이터셋 작성
- Next.js 프로젝트 초기화
- UI 컴포넌트 (v0 생성)
- RAG + 파인튜닝 파이프라인 연결
- Vercel 배포

---

## [0.1.0] — 2026-03-30

### Added
- 프로젝트 초기화
- `docs/requirements.md` — 요구사항 분석 문서
- `docs/changelog.md` — 변경 이력 문서
- `docs/todo.md` — 할일 목록
- `docs/architecture.md` — 시스템 아키텍처
- `README.md` — 프로젝트 소개

### Decided
- 기술 스택 확정: Next.js + OpenAI API + Supabase pgvector + Vercel
- RAG 역할: "무엇을 말할지" (제품 자료 검색)
- 파인튜닝 역할: "어떻게 말할지" (회사 톤앤매너 학습)
- 모델: gpt-4o-mini 파인튜닝

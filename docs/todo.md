# 할일 목록 (TODO)

> 상태: ⬜ 미시작 / 🔄 진행중 / ✅ 완료 / ❌ 블로킹

---

## Day 1~2: Supabase 벡터 DB 세팅

- ⬜ Supabase 프로젝트 생성
- ⬜ pgvector 익스텐션 활성화 (`CREATE EXTENSION vector`)
- ⬜ `documents` 테이블 생성 → `supabase/setup.sql` 실행
- ✅ 제품 자료 텍스트 준비 (FAQ 10개 + 영업 스크립트 5개 + 고객 사례 5개)
- ✅ 임베딩 스크립트 작성 (`scripts/embed-documents.ts`)
- ⬜ `.env.local`에 API 키 입력 후 `npm run embed` 실행
- ⬜ Supabase에 문서 업로드 확인
- ⬜ 유사도 검색 함수 테스트 (`match_documents`)

## Day 3~4: OpenAI 파인튜닝

- ⬜ 영업 이메일 예시 30~50개 작성
- ⬜ JSONL 포맷으로 변환 (`data/training.jsonl`)
- ⬜ OpenAI API로 파인튜닝 잡 생성
- ⬜ 파인튜닝 완료 대기 (수 시간 소요)
- ⬜ 파인튜닝 모델 ID 기록 및 응답 품질 테스트

## Day 5~6: UI + 파이프라인 연결

- ✅ Next.js 프로젝트 초기화
- ⬜ v0로 UI 디자인 생성 (입력 폼 + 이메일 출력 영역)
- ⬜ `/api/generate` API Route 작성
  - ⬜ 입력값 받기 (고객사, 업종, 니즈)
  - ⬜ RAG: Supabase 유사도 검색
  - ⬜ 파인튜닝 모델에 컨텍스트 주입 + 이메일 생성
- ⬜ 프론트-백 연결 및 E2E 동작 확인
- ⬜ 환경변수 정리 (`.env.local`, `.env.example`)

## Day 7: 배포 및 포트폴리오 마무리

- ⬜ GitHub 레포 생성 및 초기 커밋
- ⬜ `README.md` 완성 (프로젝트 소개 + 아키텍처 다이어그램 + 데모 링크)
- ⬜ Vercel 연동 + 환경변수 설정
- ⬜ 배포 URL 확인 및 동작 테스트
- ⬜ 포트폴리오에 링크 추가

---

## 블로킹 이슈

없음

---

## 메모

- OpenAI 파인튜닝은 수 시간 걸리므로 Day 3 저녁에 잡 제출 → Day 4 아침에 결과 확인
- v0 사용 시 생성된 컴포넌트를 `app/` 디렉토리에 그대로 붙여넣기
- Supabase 무료 플랜: DB 500MB, Edge Function 50만 건/월

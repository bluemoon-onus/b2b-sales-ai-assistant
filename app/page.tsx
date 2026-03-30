"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = [
  { label: "고객 정보 임베딩 생성 중...", progress: 15, duration: 2000 },
  { label: "관련 제품 자료 검색 중...", progress: 40, duration: 2500 },
  { label: "이메일 초안 작성 중...", progress: 75, duration: 99999 },
];

const INDUSTRIES = [
  "제조업",
  "IT/소프트웨어",
  "금융/핀테크",
  "유통/물류",
  "의료/헬스케어",
  "교육",
  "건설/부동산",
  "기타",
];

type Source = { type: string; preview: string };

export default function Home() {
  const [mode, setMode] = useState<"claude" | "openai">("claude");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [needs, setNeeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setStepIndex(0);
    setProgress(0);

    let elapsed = 0;
    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setStepIndex(i);
        setProgress(step.progress);
      }, elapsed);
      timersRef.current.push(t);
      elapsed += step.duration;
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setEmail(null);
    setSources([]);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, industry, needs, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "알 수 없는 오류");
      setProgress(100);
      setStepIndex(STEPS.length - 1);
      setTimeout(() => {
        setEmail(data.email);
        setSources(data.sources ?? []);
        setLoading(false);
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">SalesAI</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              Beta
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            고객 정보를 입력하면 개인화된 영업 이메일을 자동 생성합니다
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        {/* 입력 폼 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">고객 정보 입력</h2>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setMode("claude")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                  mode === "claude"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Claude
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  mode === "claude" ? "bg-blue-500 text-blue-100" : "bg-gray-100 text-gray-500"
                }`}>RAG</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("openai")}
                className={`px-3 py-1.5 flex items-center gap-1.5 border-l border-gray-200 transition ${
                  mode === "openai"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                OpenAI
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  mode === "openai" ? "bg-emerald-500 text-emerald-100" : "bg-gray-100 text-gray-500"
                }`}>RAG + 파인튜닝</span>
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                회사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="예: ABC제조"
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                업종 <span className="text-red-500">*</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                핵심 니즈 / 페인포인트 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder="예: 영업팀 생산성 향상, CRM 도입 검토 중"
                required
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              이메일 초안 생성
            </button>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{STEPS[stepIndex].label}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </section>

        {/* 에러 */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 결과 */}
        {email && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                생성된 영업 이메일
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
              >
                {copied ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    복사됨
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    복사
                  </>
                )}
              </button>
            </div>

            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 font-sans">
              {email}
            </pre>

            {sources.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  참고한 제품 자료
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <span
                      key={i}
                      title={s.preview}
                      className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500"
                    >
                      {s.type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

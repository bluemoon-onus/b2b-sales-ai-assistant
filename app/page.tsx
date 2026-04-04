"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = {
  ko: [
    { label: "고객 정보 임베딩 생성 중...", progress: 15, duration: 2000 },
    { label: "관련 제품 자료 검색 중...", progress: 40, duration: 2500 },
    { label: "이메일 초안 작성 중...", progress: 75, duration: 99999 },
  ],
  en: [
    { label: "Generating customer embedding...", progress: 15, duration: 2000 },
    { label: "Searching relevant product docs...", progress: 40, duration: 2500 },
    { label: "Drafting email...", progress: 75, duration: 99999 },
  ],
};

const INDUSTRIES = {
  ko: ["제조업", "IT/소프트웨어", "금융/핀테크", "유통/물류", "의료/헬스케어", "교육", "건설/부동산", "기타"],
  en: ["Manufacturing", "IT/Software", "Finance/Fintech", "Distribution/Logistics", "Healthcare", "Education", "Construction/Real Estate", "Other"],
};

const EMAIL_TYPES = {
  ko: ["제품홍보", "사례 중심 팔로업", "데모 후 맞춤 제안", "가격문의 회신", "무료체험 제안", "보안/컴플라이언스 문의", "업종별 맞춤 제안"],
  en: ["Product Promotion", "Case-Based Follow-Up", "Post-Demo Custom Proposal", "Price Inquiry Reply", "Free Trial Offer", "Security/Compliance Inquiry", "Industry-Specific Proposal"],
};

const UI = {
  ko: {
    title: "Sales AI Assistant",
    subtitle: "고객 정보를 입력하면 개인화된 영업 이메일을 자동 생성합니다",
    sectionTitle: "고객 정보 입력",
    companyLabel: "회사명",
    companyPlaceholder: "예: ABC제조",
    industryLabel: "업종",
    emailTypeLabel: "이메일 초안 유형",
    keywordsLabel: "추가 내용 / 키워드",
    keywordsPlaceholder: "예: 최근 펀딩 이슈, 경쟁사 대비 강조할 점, 특정 기능 언급 등",
    submitBtn: "이메일 초안 생성",
    resultTitle: "생성된 영업 이메일",
    copyBtn: "복사",
    copiedBtn: "복사됨",
    sourcesLabel: "참고한 제품 자료",
  },
  en: {
    title: "Sales AI Assistant",
    subtitle: "Enter customer info to auto-generate a personalized sales email",
    sectionTitle: "Customer Information",
    companyLabel: "Company Name",
    companyPlaceholder: "e.g. Acme Corp",
    industryLabel: "Industry",
    emailTypeLabel: "Email Draft Type",
    keywordsLabel: "Additional Notes / Keywords",
    keywordsPlaceholder: "e.g. recent funding news, key differentiators, specific features to mention",
    submitBtn: "Generate Email Draft",
    resultTitle: "Generated Sales Email",
    copyBtn: "Copy",
    copiedBtn: "Copied",
    sourcesLabel: "Referenced Product Docs",
  },
};

type Source = { type: string; preview: string };
type Lang = "ko" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [mode, setMode] = useState<"claude" | "openai">("claude");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES.ko[0]);
  const [emailType, setEmailType] = useState(EMAIL_TYPES.ko[0]);
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const steps = STEPS[lang];
  const industries = INDUSTRIES[lang];
  const emailTypes = EMAIL_TYPES[lang];
  const ui = UI[lang];

  useEffect(() => {
    setIndustry(INDUSTRIES[lang][0]);
    setEmailType(EMAIL_TYPES[lang][0]);
  }, [lang]);

  useEffect(() => {
    if (!loading) return;
    setStepIndex(0);
    setProgress(0);

    let elapsed = 0;
    steps.forEach((step, i) => {
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
        body: JSON.stringify({ company, industry, needs: emailType, keywords, mode, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (lang === "ko" ? "알 수 없는 오류" : "Unknown error"));
      setProgress(100);
      setStepIndex(steps.length - 1);
      setTimeout(() => {
        setEmail(data.email);
        setSources(data.sources ?? []);
        setLoading(false);
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === "ko" ? "오류가 발생했습니다." : "An error occurred."));
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
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#f8f7ff" }}>
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(14,165,233,0.08) 0%, transparent 55%)",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 border-b"
        style={{
          borderColor: "rgba(124,58,237,0.1)",
          background: "rgba(248,247,255,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #0ea5e9)" }}
            >
              S
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ color: "#1a1730" }}>
              {ui.title}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                background: "rgba(124,58,237,0.1)",
                color: "#7c3aed",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              Beta
            </span>
          </div>

          {/* Language toggle */}
          <div
            className="flex rounded-lg overflow-hidden text-xs font-medium"
            style={{ border: "1px solid rgba(124,58,237,0.15)" }}
          >
            {(["ko", "en"] as Lang[]).map((l, idx) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className="px-3 py-1.5 transition-all"
                style={{
                  background: lang === l ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent",
                  color: lang === l ? "#fff" : "#9188b0",
                  borderLeft: idx === 1 ? "1px solid rgba(124,58,237,0.15)" : undefined,
                }}
              >
                {l === "ko" ? "한국어" : "English"}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-6 pb-3">
          <p className="text-xs" style={{ color: "#9188b0" }}>{ui.subtitle}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-10 space-y-6">
        {/* Input card */}
        <section
          className="glass-card rounded-2xl p-6"
          style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.08), 0 1px 4px rgba(124,58,237,0.06)" }}
        >
          {/* Section header + model toggle */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#1a1730", letterSpacing: "0.07em" }}>
              {ui.sectionTitle}
            </h2>

            <div
              className="flex rounded-xl overflow-hidden text-xs font-semibold"
              style={{ border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <button
                type="button"
                onClick={() => setMode("claude")}
                className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                style={{
                  background: mode === "claude" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent",
                  color: mode === "claude" ? "#fff" : "#9188b0",
                  boxShadow: mode === "claude" ? "0 2px 10px rgba(124,58,237,0.3)" : undefined,
                }}
              >
                Claude
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{
                    background: mode === "claude" ? "rgba(255,255,255,0.25)" : "rgba(124,58,237,0.08)",
                    color: mode === "claude" ? "#fff" : "#9188b0",
                  }}
                >
                  RAG
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("openai")}
                className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                style={{
                  background: mode === "openai" ? "linear-gradient(135deg,#059669,#0ea5e9)" : "transparent",
                  color: mode === "openai" ? "#fff" : "#9188b0",
                  boxShadow: mode === "openai" ? "0 2px 10px rgba(5,150,105,0.3)" : undefined,
                  borderLeft: "1px solid rgba(124,58,237,0.15)",
                }}
              >
                OpenAI
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{
                    background: mode === "openai" ? "rgba(255,255,255,0.25)" : "rgba(124,58,237,0.08)",
                    color: mode === "openai" ? "#fff" : "#9188b0",
                  }}
                >
                  {lang === "ko" ? "파인튜닝" : "Fine-tuned"}
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#6b5fa0" }}>
                {ui.companyLabel} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={ui.companyPlaceholder}
                required
                className="light-input w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#6b5fa0" }}>
                {ui.industryLabel} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="light-select w-full rounded-xl px-4 py-2.5 text-sm pr-10"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9188b0" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#6b5fa0" }}>
                {ui.emailTypeLabel} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="light-select w-full rounded-xl px-4 py-2.5 text-sm pr-10"
                >
                  {emailTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9188b0" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#6b5fa0" }}>
                {ui.keywordsLabel}
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={ui.keywordsPlaceholder}
                className="light-input w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full rounded-xl px-4 py-3 text-sm font-semibold text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {steps[stepIndex]?.label}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {ui.submitBtn}
                </span>
              )}
            </button>

            {/* Progress */}
            {loading && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs" style={{ color: "#9188b0" }}>
                  <span>{steps[stepIndex].label}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.1)" }}>
                  <div
                    className="progress-glow h-full rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        {email && (
          <section
            className="glass-card rounded-2xl p-6"
            style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.08), 0 1px 4px rgba(124,58,237,0.06)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#1a1730", letterSpacing: "0.07em" }}>
                {ui.resultTitle}
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: copied ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.07)",
                  border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(124,58,237,0.15)",
                  color: copied ? "#16a34a" : "#7c3aed",
                }}
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {ui.copiedBtn}
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {ui.copyBtn}
                  </>
                )}
              </button>
            </div>

            <pre
              className="whitespace-pre-wrap rounded-xl p-4 text-sm leading-relaxed font-sans"
              style={{
                background: "rgba(124,58,237,0.04)",
                border: "1px solid rgba(124,58,237,0.08)",
                color: "#2d2150",
              }}
            >
              {email}
            </pre>

            {sources.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium" style={{ color: "#9188b0" }}>
                  {ui.sourcesLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <span
                      key={i}
                      title={s.preview}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                      style={{
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.18)",
                        color: "#7c3aed",
                      }}
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

      {/* Footer */}
      <footer className="relative z-10 mt-10 pb-8 text-center">
        <p className="text-xs" style={{ color: "#c4bde0" }}>
          Powered by Claude &amp; OpenAI · RAG + Fine-tuning
        </p>
      </footer>
    </div>
  );
}

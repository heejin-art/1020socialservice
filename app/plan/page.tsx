"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AREAS } from "@/lib/places";
import { generateCourse } from "@/lib/engine";
import { won, wonShort } from "@/lib/format";
import type { Companion, PlanInput, Setting, Vibe } from "@/lib/types";
import { ArrowLeft, ArrowRight, SparkleIcon, CheckIcon } from "@/components/icons";

const BUDGETS = [10000, 20000, 30000, 50000];
const COMPANIONS: { key: Companion; label: string; emoji: string }[] = [
  { key: "solo", label: "혼자", emoji: "🧘" },
  { key: "friend", label: "친구", emoji: "👯" },
  { key: "couple", label: "연인", emoji: "💑" },
  { key: "family", label: "가족", emoji: "👨‍👩‍👧" },
];
const VIBES: { key: Vibe; label: string; emoji: string }[] = [
  { key: "trendy", label: "트렌디", emoji: "✨" },
  { key: "calm", label: "조용한", emoji: "🍃" },
  { key: "active", label: "활동적", emoji: "⚡" },
  { key: "foodie", label: "맛집", emoji: "😋" },
  { key: "culture", label: "문화·전시", emoji: "🎨" },
];
const SETTINGS: { key: Setting; label: string; emoji: string }[] = [
  { key: "any", label: "상관없음", emoji: "🎲" },
  { key: "indoor", label: "실내", emoji: "🏠" },
  { key: "outdoor", label: "야외", emoji: "🌤️" },
];
const TIMES = [
  { label: "오전부터", min: 11 * 60 },
  { label: "오후부터", min: 14 * 60 },
  { label: "저녁부터", min: 18 * 60 },
];

export default function PlanPage() {
  return (
    <Suspense>
      <PlanForm />
    </Suspense>
  );
}

function PlanForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { registerPlan, profile, coach, env } = useStore();

  const [budget, setBudget] = useState(30000);
  const [companion, setCompanion] = useState<Companion>("couple");
  const [area, setArea] = useState<string>("auto");
  const [vibes, setVibes] = useState<Vibe[]>(["trendy"]);
  const [setting, setSetting] = useState<Setting>("any");
  const [startMin, setStartMin] = useState<number>(14 * 60);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const s = params.get("setting");
    if (s === "indoor" || s === "outdoor") setSetting(s);
  }, [params]);

  const toggleVibe = (v: Vibe) =>
    setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const input: PlanInput = useMemo(
    () => ({ budget, companion, area, vibes, setting, startMin }),
    [budget, companion, area, vibes, setting, startMin]
  );

  const onSubmit = () => {
    registerPlan(input);
    setGenerating(true);
    const course = generateCourse(input, {
      profile,
      frugalBias: coach.frugalBias,
      context: env,
      seed: 7,
    });
    try {
      sessionStorage.setItem("mc:result", JSON.stringify(course));
    } catch {}
    setTimeout(() => router.push("/result"), 1900);
  };

  return (
    <main className="app-shell pb-32">
      {generating && <Generating />}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-hairline bg-canvas/90 px-4 py-3 pt-safe backdrop-blur-xl">
        <Link href="/home" className="grid h-9 w-9 place-items-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="text-[15px] font-bold">코스 설계</div>
          <div className="text-[11px] text-sub">예산만 정하면 AI가 완성해요</div>
        </div>
      </header>

      <div className="space-y-8 px-5 pt-6">
        {/* 예산 */}
        <Section step={1} title="오늘 쓸 예산은?" hint="가장 중요한 출발점이에요">
          <div className="grid grid-cols-2 gap-2.5">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`flex h-16 flex-col items-center justify-center rounded-2xl border text-center transition-all active:scale-[0.98] ${
                  budget === b
                    ? "border-brand bg-brand-soft"
                    : "border-hairline bg-canvas"
                }`}
              >
                <span
                  className={`text-[18px] font-extrabold ${
                    budget === b ? "text-brand" : "text-ink"
                  }`}
                >
                  {wonShort(b)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-sub">직접 설정</span>
              <span className="text-[15px] font-bold text-brand">{won(budget)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-3 w-full accent-brand"
            />
            <div className="mt-1 flex justify-between text-[10px] text-sub">
              <span>5천원</span>
              <span>10만원</span>
            </div>
          </div>
        </Section>

        {/* 동행 */}
        <Section step={2} title="누구와 함께?">
          <div className="grid grid-cols-4 gap-2">
            {COMPANIONS.map((c) => (
              <Pick
                key={c.key}
                active={companion === c.key}
                onClick={() => setCompanion(c.key)}
                emoji={c.emoji}
                label={c.label}
              />
            ))}
          </div>
        </Section>

        {/* 위치 */}
        <Section step={3} title="어디서 놀까?" hint="현재 위치 기준으로 추천해요">
          <div className="flex flex-wrap gap-2">
            <Chip active={area === "auto"} onClick={() => setArea("auto")}>
              📍 현재 위치
            </Chip>
            {AREAS.map((a) => (
              <Chip key={a} active={area === a} onClick={() => setArea(a)}>
                {a}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 취향 */}
        <Section step={4} title="어떤 분위기가 좋아요?" hint="여러 개 선택 가능">
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip key={v.key} active={vibes.includes(v.key)} onClick={() => toggleVibe(v.key)}>
                {v.emoji} {v.label}
              </Chip>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {SETTINGS.map((s) => (
              <Pick
                key={s.key}
                active={setting === s.key}
                onClick={() => setSetting(s.key)}
                emoji={s.emoji}
                label={s.label}
              />
            ))}
          </div>
        </Section>

        {/* 시간 */}
        <Section step={5} title="언제 시작해요?">
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((t) => (
              <button
                key={t.min}
                onClick={() => setStartMin(t.min)}
                className={`h-12 rounded-2xl border text-[13px] font-semibold transition-all active:scale-[0.98] ${
                  startMin === t.min
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-hairline bg-canvas text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-hairline bg-canvas/95 px-5 pb-safe pt-3 backdrop-blur-xl">
        {coach.frugalBias > 0.5 && (
          <p className="mb-2 flex items-center gap-1.5 text-[11.5px] text-gold">
            <SparkleIcon className="h-3.5 w-3.5" /> 생활비 코치: 남은 예산을 고려해 가성비 코스를
            우선 반영해요
          </p>
        )}
        <button onClick={onSubmit} disabled={vibes.length === 0} className="btn-brand btn-lg w-full">
          <SparkleIcon className="h-5 w-5" /> AI로 코스 설계하기
        </button>
      </div>
    </main>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-up">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">
          {step}
        </span>
        <h2 className="text-[16px] font-bold tracking-tight">{title}</h2>
        {hint && <span className="text-[11px] text-sub">· {hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Pick({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border transition-all active:scale-[0.97] ${
        active ? "border-brand bg-brand-soft" : "border-hairline bg-canvas"
      }`}
    >
      <span className="text-[22px]">{emoji}</span>
      <span className={`text-[12px] font-semibold ${active ? "text-brand" : "text-ink"}`}>
        {label}
      </span>
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip h-9 px-3.5 text-[13px] font-semibold transition-all active:scale-95 ${
        active ? "bg-ink text-white" : "border border-hairline bg-canvas text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Generating() {
  const steps = ["예산·취향 분석 중", "날씨·혼잡도·할인 반영 중", "만족도 최적 코스 설계 중"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-canvas/95 backdrop-blur-md">
      <div className="flex flex-col items-center px-8 text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-brand/40" />
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-glow">
            <SparkleIcon className="h-7 w-7" />
          </span>
        </div>
        <h2 className="mt-6 text-[18px] font-bold tracking-tight">AI가 하루를 설계하고 있어요</h2>
        <p key={i} className="mt-2 animate-fade-in text-[13.5px] text-sub">
          {steps[i]}
        </p>
        <div className="mt-5 flex gap-1.5">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx <= i ? "w-6 bg-brand" : "w-1.5 bg-hairline"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

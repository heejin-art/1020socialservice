"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { won, wonShort } from "@/lib/format";
import { badgeDone } from "@/lib/badges";
import { HEALTH_META } from "@/lib/coach";
import Ring from "@/components/Ring";
import {
  CheckIcon,
  SparkleIcon,
  TrendIcon,
  WalletIcon,
} from "@/components/icons";

export default function ProfilePage() {
  const store = useStore();
  const { budget, setBudget, coach, signals, accuracy, badges, stats, resetAll, hydrated } = store;
  const meta = HEALTH_META[coach.health];

  return (
    <main className="app-shell pb-28">
      <header className="px-5 pt-safe">
        <div className="flex items-center gap-3 pt-6">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-[26px]">
            🙂
          </span>
          <div>
            <h1 className="text-[18px] font-extrabold tracking-tight">머니코스 유저</h1>
            <p className="text-[12.5px] text-sub">
              코스 {stats.created} · 저장 {stats.saves} · 공유 {stats.shares}
            </p>
          </div>
        </div>
      </header>

      {/* 생활비 설정 */}
      <section className="mt-6 px-5">
        <div className="mb-2 flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-mint" />
          <h2 className="text-[14px] font-bold">AI 생활비 코치 설정</h2>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-5">
            <Ring value={budget.monthly ? budget.spent / budget.monthly : 0} size={84} stroke={8} className={meta.text}>
              <div>
                <div className="text-[9px] text-sub">남은</div>
                <div className="text-[13px] font-extrabold">{wonShort(coach.remaining)}</div>
              </div>
            </Ring>
            <div className="flex-1">
              <div className="text-[12px] text-sub">이번 주말 추천 예산</div>
              <div className="text-[20px] font-extrabold text-brand">{won(coach.weekendBudget)}</div>
              <span className={`chip mt-1 ${meta.tone} ${meta.text} font-semibold`}>
                {meta.label} · 하루 {wonShort(coach.dailySafe)} 권장
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Slider
              label="이번 달 생활비"
              value={budget.monthly}
              min={100000}
              max={1500000}
              step={50000}
              onChange={(v) => setBudget({ monthly: v })}
            />
            <Slider
              label="현재 사용 금액"
              value={budget.spent}
              min={0}
              max={budget.monthly}
              step={10000}
              onChange={(v) => setBudget({ spent: Math.min(v, budget.monthly) })}
              accent="text-rose-500"
            />
            <Slider
              label="이번 주 사용 금액"
              value={budget.weekSpent}
              min={0}
              max={Math.round(budget.monthly / 2)}
              step={5000}
              onChange={(v) => setBudget({ weekSpent: v })}
              accent="text-gold"
            />
          </div>
        </div>
      </section>

      {/* 학습된 취향 */}
      <section className="mt-7 px-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendIcon className="h-4 w-4 text-brand" />
            <h2 className="text-[14px] font-bold">AI가 학습한 내 취향</h2>
          </div>
          <span className="chip bg-brand-soft text-brand font-semibold">정확도 {accuracy}%</span>
        </div>
        <div className="card p-4">
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-hairline">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-mint transition-all" style={{ width: `${accuracy}%` }} />
          </div>
          {hydrated && signals.length ? (
            <div className="flex flex-wrap gap-2">
              {signals.map((s, i) => (
                <span key={i} className="chip border border-hairline bg-canvas text-ink">
                  <span>{s.emoji}</span> {s.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed text-sub">
              코스를 만들고 저장할수록 AI가 취향을 학습해 더 정확하게 추천해요.
            </p>
          )}
        </div>
      </section>

      {/* 챌린지/배지 */}
      <section className="mt-7 px-5">
        <div className="mb-2 flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-gold" />
          <h2 className="text-[14px] font-bold">챌린지 & 배지</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((b) => {
            const done = badgeDone(b);
            return (
              <div
                key={b.id}
                className={`card p-4 ${done ? "border-brand bg-brand-soft/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[26px] ${done ? "" : "grayscale opacity-70"}`}>{b.emoji}</span>
                  {done && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-[13.5px] font-bold">{b.title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-sub">{b.desc}</p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${(b.progress / b.goal) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-sub">
                  <span>{b.progress}/{b.goal}</span>
                  <span className="text-brand">{b.reward}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* footer actions */}
      <section className="mt-8 px-5">
        <div className="card divide-y divide-hairline">
          <Link href="/" className="flex items-center justify-between px-4 py-3.5 text-[14px]">
            <span>서비스 소개</span>
            <span className="text-sub">›</span>
          </Link>
          <button
            onClick={() => {
              if (confirm("모든 데모 데이터를 초기화할까요?")) resetAll();
            }}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] text-rose-500"
          >
            <span>데모 데이터 초기화</span>
            <span>›</span>
          </button>
        </div>
        <p className="mt-5 text-center text-[11px] leading-relaxed text-sub/70">
          머니코스는 PWA입니다. 모바일 브라우저의 ‘홈 화면에 추가’로
          <br />
          앱처럼 설치해 사용할 수 있어요.
        </p>
      </section>
    </main>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent = "text-brand",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-sub">{label}</span>
        <span className={`text-[13px] font-bold ${accent}`}>{won(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand"
      />
    </div>
  );
}

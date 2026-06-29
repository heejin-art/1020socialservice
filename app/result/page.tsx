"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { generateCourse } from "@/lib/engine";
import type { GeneratedCourse } from "@/lib/types";
import { durationLabel, minToTime, pct, won, wonShort } from "@/lib/format";
import Ring from "@/components/Ring";
import {
  ArrowLeft,
  BookmarkFill,
  BookmarkIcon,
  CheckIcon,
  RefreshIcon,
  ShareIcon,
  SparkleIcon,
  StarIcon,
  ClockIcon,
  WalletIcon,
} from "@/components/icons";

const COMPANION_LABEL: Record<string, string> = {
  solo: "혼자",
  friend: "친구와",
  couple: "연인과",
  family: "가족과",
};

export default function ResultPage() {
  const router = useRouter();
  const store = useStore();
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [seed, setSeed] = useState(7);
  const [toast, setToast] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mc:result");
      if (raw) setCourse(JSON.parse(raw));
    } catch {}
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  if (!course) {
    return (
      <main className="app-shell grid place-items-center px-8 text-center">
        <div>
          <div className="text-[40px]">🗺️</div>
          <p className="mt-3 text-[14px] text-sub">아직 설계된 코스가 없어요.</p>
          <Link href="/plan" className="btn-brand btn-md mt-5">
            코스 설계하러 가기
          </Link>
        </div>
      </main>
    );
  }

  const saved = store.isGeneratedSaved(course.id);
  const overBudget = course.totalCost > course.input.budget;

  const regenerate = () => {
    const next = seed + 1;
    setSeed(next);
    const c = generateCourse(course.input, {
      profile: store.profile,
      frugalBias: store.coach.frugalBias,
      context: store.env,
      seed: next,
    });
    setCourse(c);
    setRan(false);
    try {
      sessionStorage.setItem("mc:result", JSON.stringify(c));
    } catch {}
    showToast("새로운 코스를 추천했어요");
  };

  const onSave = () => {
    store.saveGenerated(course);
    showToast(saved ? "저장을 취소했어요" : "내 코스에 저장했어요");
  };

  const onShare = async () => {
    store.recordShare();
    const text = `머니코스 · ${course.area} ${wonShort(course.input.budget)} 코스`;
    try {
      if (navigator.share) await navigator.share({ title: "머니코스", text });
      else {
        await navigator.clipboard.writeText(text);
        showToast("코스 링크를 복사했어요");
        return;
      }
    } catch {}
    showToast("코스를 공유했어요");
  };

  const onRun = () => {
    if (ran) return;
    store.runCourse({
      totalCost: course.totalCost,
      couple: course.input.companion === "couple",
      categories: course.stops.map((s) => s.place.category),
    });
    setRan(true);
    showToast(`${won(course.totalCost)} 지출로 기록했어요`);
  };

  return (
    <main className="app-shell pb-28">
      {/* header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-canvas/90 px-4 py-3 pt-safe backdrop-blur-xl">
        <Link href="/plan" className="grid h-9 w-9 place-items-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-[14px] font-bold">AI 설계 코스</span>
        <button
          onClick={onSave}
          className="grid h-9 w-9 place-items-center rounded-full bg-muted"
          aria-label="저장"
        >
          {saved ? <BookmarkFill className="h-5 w-5 text-brand" /> : <BookmarkIcon className="h-5 w-5" />}
        </button>
      </header>

      {/* hero summary */}
      <section className="relative overflow-hidden px-5 pt-6">
        <div className="absolute inset-0 mesh-brand" />
        <div className="relative animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="chip bg-ink text-white">{COMPANION_LABEL[course.input.companion]}</span>
            <span className="chip bg-canvas text-ink">{course.area}</span>
            <span className="chip bg-canvas text-ink">
              {minToTime(course.stops[0]?.startMin ?? 0)} 시작
            </span>
          </div>
          <h1 className="mt-3 text-[24px] font-extrabold leading-snug tracking-tight">
            {wonShort(course.input.budget)}로 즐기는
            <br />
            {course.area} 하루 코스
          </h1>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="card flex flex-col items-center justify-center py-4">
              <Ring value={course.satisfaction / 100} size={64} stroke={7} className="text-brand">
                <span className="text-[15px] font-extrabold text-brand">{course.satisfaction}</span>
              </Ring>
              <span className="mt-1.5 text-[11px] text-sub">AI 만족도</span>
            </div>
            <div className="card flex flex-col items-center justify-center py-4">
              <WalletIcon className="h-6 w-6 text-mint" />
              <span className="mt-1.5 text-[15px] font-extrabold text-ink">
                {wonShort(course.totalCost)}
              </span>
              <span className="text-[11px] text-sub">예상 지출</span>
            </div>
            <div className="card flex flex-col items-center justify-center py-4">
              <ClockIcon className="h-6 w-6 text-ink" />
              <span className="mt-1.5 text-[15px] font-extrabold text-ink">
                {durationLabel(course.durationMin)}
              </span>
              <span className="text-[11px] text-sub">총 소요</span>
            </div>
          </div>

          {/* budget bar */}
          <div className="card mt-2.5 p-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-sub">예산 사용률</span>
              <span className={`font-bold ${overBudget ? "text-rose-500" : "text-brand"}`}>
                {pct(course.budgetUsed)} · {won(course.totalCost)} / {won(course.input.budget)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-hairline">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-rose-500" : "bg-brand"}`}
                style={{ width: `${Math.min(100, course.budgetUsed * 100)}%` }}
              />
            </div>
          </div>

          {course.highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {course.highlights.map((h) => (
                <span key={h} className="chip bg-brand-soft text-brand font-semibold">
                  <SparkleIcon className="h-3 w-3" /> {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* timeline */}
      <section className="mt-7 px-5">
        <h2 className="mb-4 text-[15px] font-bold">하루 타임라인</h2>
        <ol className="relative">
          {course.stops.map((s, i) => (
            <li key={s.place.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* line */}
              {i < course.stops.length - 1 && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-20px)] w-px bg-hairline" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-muted text-[20px]">
                  {s.place.emoji}
                </span>
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-brand">
                  {minToTime(s.startMin)}
                  <span className="text-sub">· {durationLabel(s.place.duration)}</span>
                </div>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-bold leading-tight">{s.place.name}</h3>
                  <span className="shrink-0 text-[14px] font-bold text-ink">
                    {wonShort(s.place.cost)}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-sub">{s.place.blurb}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold">
                    <StarIcon className="h-3 w-3" /> {s.place.rating}
                  </span>
                  {s.place.signal?.discount ? (
                    <span className="chip bg-rose-50 text-rose-500">
                      {s.place.signal.discount}% 할인
                    </span>
                  ) : null}
                  {s.place.signal?.popup ? (
                    <span className="chip bg-violet-50 text-violet-600">팝업</span>
                  ) : null}
                  {s.place.cost === 0 ? (
                    <span className="chip bg-mint-soft text-mint">무료</span>
                  ) : null}
                </div>
                <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-brand-soft/60 px-3 py-2">
                  <SparkleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <p className="text-[12px] leading-relaxed text-brand/90">{s.reason}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* coach note */}
      <section className="mt-2 px-5">
        <div className="card flex items-start gap-2.5 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mint-soft text-mint">
            <WalletIcon className="h-4.5 w-4.5" />
          </span>
          <p className="text-[12.5px] leading-relaxed text-ink">
            이 코스를 다녀오면 이번 달 남은 예산은{" "}
            <b className="text-mint">{won(Math.max(0, store.coach.remaining - course.totalCost))}</b>
            가 돼요. {store.coach.detail}
          </p>
        </div>
      </section>

      {/* actions */}
      <section className="mt-5 grid grid-cols-3 gap-2 px-5">
        <button onClick={regenerate} className="btn-ghost btn-md flex-col !h-auto gap-1 py-3">
          <RefreshIcon className="h-5 w-5" />
          <span className="text-[11px]">다시 추천</span>
        </button>
        <button onClick={onShare} className="btn-ghost btn-md flex-col !h-auto gap-1 py-3">
          <ShareIcon className="h-5 w-5" />
          <span className="text-[11px]">공유</span>
        </button>
        <button
          onClick={onRun}
          className={`btn-md flex-col !h-auto gap-1 py-3 ${ran ? "btn-ghost text-mint" : "btn-ghost"}`}
        >
          <CheckIcon className="h-5 w-5" />
          <span className="text-[11px]">{ran ? "기록됨" : "다녀왔어요"}</span>
        </button>
      </section>

      <div className="mt-3 px-5">
        <button onClick={onSave} className="btn-primary btn-lg w-full">
          {saved ? "저장됨 · 내 코스에서 보기" : "이 코스 저장하기"}
        </button>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit animate-fade-up rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white shadow-float">
          {toast}
        </div>
      )}
    </main>
  );
}

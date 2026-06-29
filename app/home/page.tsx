"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { generateBriefings } from "@/lib/briefing";
import { SOCIAL_COURSES, getSocialCourse } from "@/lib/courses";
import CoachCard from "@/components/CoachCard";
import BriefingCard from "@/components/BriefingCard";
import CourseCard from "@/components/CourseCard";
import { badgeDone } from "@/lib/badges";
import {
  ArrowRight,
  RouteIcon,
  SparkleIcon,
  TrendIcon,
} from "@/components/icons";

const WEATHER_LABEL: Record<string, string> = {
  clear: "맑음",
  rain: "비",
  cloudy: "흐림",
  hot: "무더움",
};

export default function HomePage() {
  const store = useStore();
  const { env, coach, signals, accuracy, badges, savedIds, daysLeft, hydrated } = store;

  const savedPopup = useMemo(() => {
    const c = savedIds.map(getSocialCourse).find((x) => x?.tags.includes("팝업"));
    return c ? { title: c.title } : null;
  }, [savedIds]);

  const briefings = useMemo(
    () => generateBriefings({ budget: store.budget, context: env, savedPopup, daysLeft }),
    [store.budget, env, savedPopup, daysLeft]
  );

  const recommended = useMemo(() => {
    const prof = store.profile;
    return [...SOCIAL_COURSES]
      .map((c) => {
        let s = c.rating * 2;
        s += (prof.category[c.stops[0]?.category] ?? 0) * 0.4;
        s += (prof.companion[c.companion] ?? 0) * 0.5;
        // 생활비 코치: 절약 모드면 저렴한 코스 우대
        s -= (c.totalCost / 10000) * coach.frugalBias * 1.2;
        return { c, s };
      })
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.c);
  }, [store.profile, coach.frugalBias]);

  const activeBadges = badges.filter((b) => !badgeDone(b) && b.progress > 0).slice(0, 3);

  return (
    <main className="app-shell pb-28">
      {/* header */}
      <header className="px-5 pt-safe">
        <div className="flex items-center justify-between pt-5">
          <div>
            <p className="text-[12px] font-medium text-sub">
              {WEATHER_LABEL[env.weather]} · {env.temp}°C · 서울
            </p>
            <h1 className="mt-0.5 text-[22px] font-extrabold tracking-tight">
              오늘 뭐하지? <span className="text-brand">AI가 정리했어요</span>
            </h1>
          </div>
          <Link
            href="/profile"
            className="grid h-10 w-10 place-items-center rounded-full bg-muted text-[18px]"
          >
            🙂
          </Link>
        </div>
      </header>

      {/* AI 브리핑 */}
      <section className="mt-5">
        <div className="flex items-center gap-2 px-5">
          <SparkleIcon className="h-4 w-4 text-brand" />
          <h2 className="text-[13px] font-bold">오늘의 AI 브리핑</h2>
        </div>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
          {briefings.map((b, i) => (
            <BriefingCard key={i} b={b} />
          ))}
        </div>
      </section>

      {/* 코치 */}
      <section className="mt-5 px-5">
        <CoachCard />
      </section>

      {/* 코스 설계 CTA */}
      <section className="mt-4 px-5">
        <Link
          href="/plan"
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-ink p-5 text-white"
        >
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-brand/40 blur-2xl" />
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <RouteIcon className="h-6 w-6" />
          </span>
          <div className="relative flex-1">
            <div className="text-[15px] font-bold">오늘 코스 설계하기</div>
            <div className="text-[12.5px] text-white/70">
              예산만 입력하면 10초 만에 완성돼요
            </div>
          </div>
          <ArrowRight className="relative h-5 w-5 transition-transform group-active:translate-x-1" />
        </Link>
      </section>

      {/* 학습된 취향 */}
      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendIcon className="h-4 w-4 text-brand" />
            <h2 className="text-[13px] font-bold">AI가 학습한 내 취향</h2>
          </div>
          <span className="chip bg-brand-soft text-brand font-semibold">정확도 {accuracy}%</span>
        </div>
        {hydrated && signals.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {signals.map((s, i) => (
              <span
                key={i}
                className="chip border border-hairline bg-canvas text-ink"
                style={{ opacity: 0.6 + s.strength * 0.4 }}
              >
                <span>{s.emoji}</span> {s.label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-3 card p-4 text-[13px] leading-relaxed text-sub">
            아직 학습된 취향이 없어요. 코스를 만들고 저장할수록 AI가 당신을 더
            정확히 추천해요.
          </div>
        )}
      </section>

      {/* 추천 코스 */}
      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold">
            {coach.frugalBias > 0.5 ? "예산을 아끼는 추천 코스" : "오늘의 추천 코스"}
          </h2>
          <Link href="/explore" className="text-[12.5px] font-semibold text-brand">
            더보기
          </Link>
        </div>
        <div className="mt-3 space-y-4">
          {recommended.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* 미션 */}
      {activeBadges.length > 0 && (
        <section className="mt-7 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold">진행 중인 챌린지</h2>
            <Link href="/profile" className="text-[12.5px] font-semibold text-brand">
              전체보기
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5">
            {activeBadges.map((b) => (
              <div key={b.id} className="card flex items-center gap-3 p-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-[20px]">
                  {b.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold">{b.title}</span>
                    <span className="text-[11px] font-semibold text-sub">
                      {b.progress}/{b.goal}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hairline">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${(b.progress / b.goal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

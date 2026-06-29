"use client";

import { useMemo, useState } from "react";
import { SOCIAL_COURSES, RANKING_BOARDS } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import { StarIcon, TrendIcon, UsersIcon } from "@/components/icons";

const BUDGET_FILTERS = [
  { label: "전체", value: 0 },
  { label: "1만원", value: 10000 },
  { label: "2만원", value: 20000 },
  { label: "3만원", value: 30000 },
  { label: "5만원+", value: 50000 },
];

type Tab = "feed" | "rank";

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [budget, setBudget] = useState(0);

  const feed = useMemo(() => {
    let list = [...SOCIAL_COURSES];
    if (budget) {
      list = list.filter((c) =>
        budget === 50000 ? c.budget >= 50000 : c.budget === budget
      );
    }
    return list.sort((a, b) => b.likes - a.likes);
  }, [budget]);

  return (
    <main className="app-shell pb-28">
      <header className="px-5 pt-safe">
        <div className="pt-5">
          <h1 className="text-[22px] font-extrabold tracking-tight">탐색</h1>
          <p className="mt-0.5 text-[13px] text-sub">
            또래가 실제로 만족한 예산 코스를 찾아보세요
          </p>
        </div>

        {/* tabs */}
        <div className="mt-4 flex gap-1 rounded-2xl bg-muted p-1">
          <TabBtn active={tab === "feed"} onClick={() => setTab("feed")}>
            추천 피드
          </TabBtn>
          <TabBtn active={tab === "rank"} onClick={() => setTab("rank")}>
            실데이터 랭킹
          </TabBtn>
        </div>
      </header>

      {tab === "feed" ? (
        <>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            {BUDGET_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setBudget(f.value)}
                className={`chip h-9 shrink-0 px-3.5 text-[13px] font-semibold transition active:scale-95 ${
                  budget === f.value
                    ? "bg-ink text-white"
                    : "border border-hairline bg-canvas text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-4 px-5">
            {feed.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-8 px-5">
          <div className="card flex items-start gap-2.5 bg-ink p-4 text-white">
            <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-[12.5px] leading-relaxed text-white/85">
              AI 추천과 <b className="text-white">실제 사용자 소비 데이터</b>를 함께 보여드려요.
              세그먼트별로 가장 만족도가 높았던 코스 TOP입니다.
            </p>
          </div>

          {RANKING_BOARDS.map((board) => (
            <section key={board.id}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <TrendIcon className="h-4 w-4 text-brand" />
                    <h2 className="text-[14.5px] font-bold">{board.segment}</h2>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-sub">
                    {board.metricLabel} TOP {board.courses.length}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-gold">
                  <StarIcon className="h-3.5 w-3.5" />
                  {board.courses[0]?.rating}
                </span>
              </div>
              <div className="space-y-4">
                {board.courses.map((c, i) => (
                  <CourseCard key={c.id} course={c} rank={i + 1} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function TabBtn({
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
      className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
        active ? "bg-canvas text-ink shadow-sm" : "text-sub"
      }`}
    >
      {children}
    </button>
  );
}

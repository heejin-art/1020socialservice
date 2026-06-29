"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { getSocialCourse } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import { durationLabel, wonShort } from "@/lib/format";
import type { GeneratedCourse } from "@/lib/types";
import { RouteIcon, SparkleIcon } from "@/components/icons";

type Tab = "mine" | "saved";

export default function SavedPage() {
  const [tab, setTab] = useState<Tab>("mine");
  const { myCourses, savedIds } = useStore();
  const savedCourses = savedIds.map(getSocialCourse).filter(Boolean);

  return (
    <main className="app-shell pb-28">
      <header className="px-5 pt-safe">
        <div className="pt-5">
          <h1 className="text-[22px] font-extrabold tracking-tight">저장함</h1>
          <p className="mt-0.5 text-[13px] text-sub">내가 만든 코스와 저장한 코스</p>
        </div>
        <div className="mt-4 flex gap-1 rounded-2xl bg-muted p-1">
          <button
            onClick={() => setTab("mine")}
            className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
              tab === "mine" ? "bg-canvas text-ink shadow-sm" : "text-sub"
            }`}
          >
            내 코스 {myCourses.length > 0 && `(${myCourses.length})`}
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
              tab === "saved" ? "bg-canvas text-ink shadow-sm" : "text-sub"
            }`}
          >
            저장한 코스 {savedCourses.length > 0 && `(${savedCourses.length})`}
          </button>
        </div>
      </header>

      <div className="mt-5 px-5">
        {tab === "mine" ? (
          myCourses.length ? (
            <div className="space-y-3">
              {myCourses.map((c) => (
                <MyCourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <Empty
              emoji="🧭"
              title="아직 만든 코스가 없어요"
              desc="예산만 입력하면 AI가 하루 코스를 설계해드려요."
            />
          )
        ) : savedCourses.length ? (
          <div className="space-y-4">
            {savedCourses.map((c) => (
              <CourseCard key={c!.id} course={c!} />
            ))}
          </div>
        ) : (
          <Empty
            emoji="🔖"
            title="저장한 코스가 없어요"
            desc="탐색에서 마음에 드는 코스를 저장해보세요."
          />
        )}
      </div>
    </main>
  );
}

function MyCourseCard({ course }: { course: GeneratedCourse }) {
  const router = useRouter();
  const open = () => {
    try {
      sessionStorage.setItem("mc:result", JSON.stringify(course));
    } catch {}
    router.push("/result");
  };
  return (
    <button onClick={open} className="card flex w-full items-center gap-3.5 p-4 text-left active:scale-[0.99]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
        <RouteIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[15px]">
          {course.stops.slice(0, 4).map((s, i) => (
            <span key={i}>{s.place.emoji}</span>
          ))}
        </div>
        <div className="mt-1 text-[14px] font-bold">
          {wonShort(course.input.budget)} {course.area} 코스
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-sub">
          <span className="inline-flex items-center gap-0.5 font-semibold text-brand">
            <SparkleIcon className="h-3 w-3" /> 만족도 {course.satisfaction}
          </span>
          <span>· 실비 {wonShort(course.totalCost)}</span>
          <span>· {durationLabel(course.durationMin)}</span>
        </div>
      </div>
    </button>
  );
}

function Empty({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="mt-10 flex flex-col items-center px-6 text-center">
      <div className="text-[44px]">{emoji}</div>
      <h2 className="mt-3 text-[16px] font-bold">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">{desc}</p>
      <Link href="/plan" className="btn-brand btn-md mt-5">
        코스 설계하기
      </Link>
    </div>
  );
}

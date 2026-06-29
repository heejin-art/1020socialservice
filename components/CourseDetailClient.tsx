"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSocialCourse, SOCIAL_COURSES, COVER_GRADIENTS } from "@/lib/courses";
import { useStore } from "@/lib/store";
import { won, wonShort } from "@/lib/format";
import CourseCard from "@/components/CourseCard";
import {
  ArrowLeft,
  BookmarkFill,
  BookmarkIcon,
  CheckIcon,
  HeartFill,
  HeartIcon,
  ShareIcon,
  StarIcon,
} from "@/components/icons";

const COMPANION_LABEL: Record<string, string> = {
  solo: "혼자",
  friend: "친구와",
  couple: "연인과",
  family: "가족과",
};

const REVIEWS = [
  { name: "수민", avatar: "🐣", text: "예산 딱 맞춰서 알차게 놀았어요. 동선이 진짜 좋네요!", rating: 5 },
  { name: "현우", avatar: "🦊", text: "무료 코스가 섞여 있어서 부담 없이 다녀왔습니다.", rating: 5 },
  { name: "다은", avatar: "🐰", text: "팝업이 생각보다 알차서 만족! 사진도 잘 나와요.", rating: 4 },
];

export default function CourseDetailClient({ id }: { id: string }) {
  const course = getSocialCourse(id);
  const store = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [followed, setFollowed] = useState(false);

  const similar = useMemo(
    () => SOCIAL_COURSES.filter((c) => c.id !== id && c.companion === course?.companion).slice(0, 2),
    [id, course]
  );

  if (!course) {
    return (
      <main className="app-shell grid place-items-center px-8 text-center">
        <div>
          <div className="text-[40px]">🔍</div>
          <p className="mt-3 text-[14px] text-sub">코스를 찾을 수 없어요.</p>
          <Link href="/explore" className="btn-brand btn-md mt-5">
            탐색으로 가기
          </Link>
        </div>
      </main>
    );
  }

  const saved = store.isSaved(course.id);
  const liked = store.isLiked(course.id);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const onFollow = () => {
    if (followed) return;
    store.runCourse({
      totalCost: course.totalCost,
      couple: course.companion === "couple",
      categories: course.stops.map((s) => s.category),
    });
    setFollowed(true);
    showToast(`이 코스로 다녀왔어요 · ${won(course.totalCost)} 기록`);
  };

  const onShare = async () => {
    store.recordShare();
    try {
      if (navigator.share) await navigator.share({ title: course.title, text: course.title });
      else await navigator.clipboard.writeText(course.title);
    } catch {}
    showToast("코스를 공유했어요");
  };

  let running = 0;

  return (
    <main className="app-shell pb-28">
      {/* cover */}
      <div className={`relative h-56 bg-gradient-to-br ${COVER_GRADIENTS[course.cover]}`}>
        <div className="absolute inset-0 grain opacity-30" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-safe">
          <Link
            href="/explore"
            className="mt-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <button
            onClick={onShare}
            className="mt-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur"
          >
            <ShareIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="absolute bottom-4 left-5 flex gap-1.5 text-[34px]">
          {course.stops.map((s, i) => (
            <span key={i} className="drop-shadow">
              {s.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* title block */}
      <section className="px-5 pt-5">
        <div className="flex flex-wrap gap-1.5">
          <span className="chip bg-brand-soft font-bold text-brand">{wonShort(course.budget)}</span>
          <span className="chip bg-muted text-ink">{COMPANION_LABEL[course.companion]}</span>
          <span className="chip bg-muted text-ink">{course.area}</span>
        </div>
        <h1 className="mt-3 text-[22px] font-extrabold leading-snug tracking-tight">
          {course.title}
        </h1>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-[18px]">
              {course.author.avatar}
            </span>
            <div>
              <div className="text-[13px] font-bold">{course.author.name}</div>
              <div className="text-[11px] text-sub">{course.author.handle}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-sub">
            <span className="inline-flex items-center gap-1 font-bold text-gold">
              <StarIcon className="h-3.5 w-3.5" /> {course.rating}
            </span>
            <span>리뷰 {course.reviews}</span>
          </div>
        </div>
      </section>

      {/* summary stats */}
      <section className="mt-4 grid grid-cols-3 gap-2 px-5">
        {[
          ["실제 지출", wonShort(course.totalCost)],
          ["저장", course.saves.toLocaleString()],
          ["좋아요", course.likes.toLocaleString()],
        ].map(([a, b]) => (
          <div key={a} className="card py-3 text-center">
            <div className="text-[15px] font-extrabold text-ink">{b}</div>
            <div className="text-[11px] text-sub">{a}</div>
          </div>
        ))}
      </section>

      {/* stops */}
      <section className="mt-7 px-5">
        <h2 className="mb-4 text-[15px] font-bold">코스 순서</h2>
        <ol className="relative">
          {course.stops.map((s, i) => {
            running += s.cost;
            return (
              <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {i < course.stops.length - 1 && (
                  <span className="absolute left-[19px] top-10 h-[calc(100%-20px)] w-px bg-hairline" />
                )}
                <span className="relative z-10 grid h-10 w-10 place-items-center rounded-2xl bg-muted text-[20px]">
                  {s.emoji}
                </span>
                <div className="flex flex-1 items-center justify-between pt-1.5">
                  <div>
                    <div className="text-[10px] font-bold text-brand">STOP {i + 1}</div>
                    <h3 className="text-[15px] font-bold">{s.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-ink">{wonShort(s.cost)}</div>
                    <div className="text-[10px] text-sub">누적 {wonShort(running)}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* tags */}
      <section className="mt-2 px-5">
        <div className="flex flex-wrap gap-1.5">
          {course.tags.map((t) => (
            <span key={t} className="chip bg-muted text-sub">
              #{t}
            </span>
          ))}
        </div>
      </section>

      {/* reviews */}
      <section className="mt-7 px-5">
        <h2 className="mb-3 text-[15px] font-bold">다녀온 사람들의 후기</h2>
        <div className="space-y-2.5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-muted">
                    {r.avatar}
                  </span>
                  <span className="text-[13px] font-bold">{r.name}</span>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gold">
                  <StarIcon className="h-3 w-3" /> {r.rating}.0
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-sub">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* similar */}
      {similar.length > 0 && (
        <section className="mt-7 px-5">
          <h2 className="mb-3 text-[15px] font-bold">비슷한 코스</h2>
          <div className="space-y-4">
            {similar.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-app items-center gap-2 border-t border-hairline bg-canvas/95 px-5 pb-safe pt-3 backdrop-blur-xl">
        <button
          onClick={() => {
            store.toggleLikeSocial(course);
          }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted"
          aria-label="좋아요"
        >
          {liked ? <HeartFill className="h-6 w-6 text-rose-500" /> : <HeartIcon className="h-6 w-6" />}
        </button>
        <button
          onClick={() => {
            store.toggleSaveSocial(course);
            showToast(saved ? "저장 취소" : "저장했어요");
          }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted"
          aria-label="저장"
        >
          {saved ? <BookmarkFill className="h-6 w-6 text-brand" /> : <BookmarkIcon className="h-6 w-6" />}
        </button>
        <button onClick={onFollow} className={`btn-lg flex-1 ${followed ? "btn-ghost text-mint" : "btn-brand"}`}>
          {followed ? (
            <>
              <CheckIcon className="h-5 w-5" /> 다녀왔어요
            </>
          ) : (
            "이 코스 따라가기"
          )}
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

"use client";

import Link from "next/link";
import type { SocialCourse } from "@/lib/types";
import { COVER_GRADIENTS } from "@/lib/courses";
import { useStore } from "@/lib/store";
import { wonShort } from "@/lib/format";
import { BookmarkFill, BookmarkIcon, HeartFill, HeartIcon, StarIcon } from "./icons";

const COMPANION_LABEL: Record<string, string> = {
  solo: "혼자",
  friend: "친구",
  couple: "커플",
  family: "가족",
};

export default function CourseCard({ course, rank }: { course: SocialCourse; rank?: number }) {
  const { isSaved, toggleSaveSocial, isLiked, toggleLikeSocial } = useStore();
  const saved = isSaved(course.id);
  const liked = isLiked(course.id);

  return (
    <Link href={`/course/${course.id}`} className="block animate-fade-up">
      <article className="card overflow-hidden transition-transform active:scale-[0.99]">
        <div
          className={`relative h-32 bg-gradient-to-br ${
            COVER_GRADIENTS[course.cover] ?? COVER_GRADIENTS.river
          }`}
        >
          <div className="absolute inset-0 grain opacity-30" />
          <div className="absolute inset-0 flex items-center gap-1.5 px-5 text-[28px]">
            {course.stops.slice(0, 4).map((s, i) => (
              <span key={i} className="drop-shadow-sm">
                {s.emoji}
              </span>
            ))}
          </div>
          {rank != null && (
            <div className="absolute left-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-black/35 text-[13px] font-bold text-white backdrop-blur">
              {rank}
            </div>
          )}
          <div className="absolute right-3 top-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSaveSocial(course);
              }}
              aria-label="저장"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition active:scale-90"
            >
              {saved ? <BookmarkFill className="h-[18px] w-[18px] text-brand" /> : <BookmarkIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            <span className="chip bg-white/90 font-bold text-ink backdrop-blur">
              {wonShort(course.budget)}
            </span>
            <span className="chip bg-black/30 text-white backdrop-blur">
              {COMPANION_LABEL[course.companion]} · {course.area}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-[15px] font-bold leading-snug text-ink">{course.title}</h3>
          <div className="mt-1.5 flex items-center gap-2 text-[12px] text-sub">
            <span>{course.author.avatar}</span>
            <span>{course.author.name}</span>
            <span className="text-hairline">·</span>
            <span>{course.createdLabel}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[12px] text-sub">
              <span className="inline-flex items-center gap-1 font-semibold text-gold">
                <StarIcon className="h-3.5 w-3.5" /> {course.rating}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleLikeSocial(course);
                }}
                className="inline-flex items-center gap-1 transition active:scale-90"
              >
                {liked ? (
                  <HeartFill className="h-4 w-4 text-rose-500" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
                {(course.likes + (liked ? 1 : 0)).toLocaleString()}
              </button>
              <span className="inline-flex items-center gap-1">
                <BookmarkIcon className="h-3.5 w-3.5" />
                {(course.saves + (saved ? 1 : 0)).toLocaleString()}
              </span>
            </div>
            <span className="text-[13px] font-bold text-ink">
              실비 {wonShort(course.totalCost)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

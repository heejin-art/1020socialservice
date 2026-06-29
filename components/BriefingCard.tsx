"use client";

import Link from "next/link";
import type { Briefing } from "@/lib/types";
import { ArrowRight } from "./icons";

const TONE: Record<Briefing["tone"], string> = {
  info: "bg-brand-soft text-brand",
  warn: "bg-amber-50 text-gold",
  good: "bg-mint-soft text-mint",
};

export default function BriefingCard({ b }: { b: Briefing }) {
  return (
    <div className="card min-w-[270px] max-w-[270px] snap-start p-4">
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 place-items-center rounded-xl text-[18px] ${TONE[b.tone]}`}>
          {b.emoji}
        </span>
        <span className="text-[12px] font-bold text-ink">{b.title}</span>
      </div>
      <p className="mt-3 min-h-[40px] text-[13px] leading-relaxed text-sub">{b.body}</p>
      {b.cta && (
        <Link
          href={b.cta.href}
          className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand"
        >
          {b.cta.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

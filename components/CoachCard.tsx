"use client";

import { useStore } from "@/lib/store";
import { HEALTH_META } from "@/lib/coach";
import { won, wonShort } from "@/lib/format";
import Ring from "./Ring";
import { SparkleIcon, WalletIcon } from "./icons";

export default function CoachCard({ compact = false }: { compact?: boolean }) {
  const { budget, coach } = useStore();
  const meta = HEALTH_META[coach.health];
  const used = budget.monthly > 0 ? budget.spent / budget.monthly : 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-mint-soft text-mint">
            <WalletIcon className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-bold text-ink">AI 생활비 코치</span>
        </div>
        <span className={`chip ${meta.tone} ${meta.text} font-semibold`}>{meta.label}</span>
      </div>

      <div className="flex items-center gap-5 px-5 py-4">
        <Ring value={used} size={92} stroke={9} className={meta.text}>
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-sub">남은 예산</div>
            <div className="text-[15px] font-extrabold leading-tight text-ink">
              {wonShort(coach.remaining)}
            </div>
          </div>
        </Ring>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-sub">이번 달 예산</span>
            <span className="font-semibold text-ink">{won(budget.monthly)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-sub">사용 금액</span>
            <span className="font-semibold text-ink">{won(budget.spent)}</span>
          </div>
          <div className="mt-3 rounded-xl bg-brand-soft px-3 py-2">
            <div className="text-[11px] text-brand/80">이번 주말 추천 예산</div>
            <div className="text-[16px] font-extrabold text-brand">
              {won(coach.weekendBudget)}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex items-start gap-2 border-t border-hairline bg-muted/60 px-5 py-3">
          <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-[12.5px] leading-relaxed text-ink">
            <b>{coach.headline}</b>
            <br />
            <span className="text-sub">{coach.detail}</span>
          </p>
        </div>
      )}
    </div>
  );
}

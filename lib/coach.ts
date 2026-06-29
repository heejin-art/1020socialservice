import type { BudgetState, CoachAdvice, SpendHealth } from "./types";
import { won, wonShort } from "./format";

function roundTo(n: number, unit: number) {
  return Math.max(0, Math.round(n / unit) * unit);
}

/**
 * AI 생활비 코치 — 남은 생활비/소비 패턴을 분석해
 * 이번 주말 권장 예산과 저비용 우대 강도(frugalBias)를 계산한다.
 */
export function getCoach(budget: BudgetState, daysLeft = 10): CoachAdvice {
  const monthly = Math.max(1, budget.monthly);
  const remaining = Math.max(0, monthly - budget.spent);
  const usedRatio = budget.spent / monthly;
  const weekBudget = monthly / 4;
  const weekRatio = weekBudget > 0 ? budget.weekSpent / weekBudget : 0;

  // 하루 권장 지출 — 월말에 days가 너무 적어 값이 튀지 않도록 최소 5일로 보정
  const dailySafe = roundTo(remaining / Math.max(5, daysLeft), 1000);

  let health: SpendHealth;
  let frugalBias: number;
  let weekendFraction: number; // 주말에 쓰기 적당한 '남은 예산' 비율
  let headline: string;
  let detail: string;

  if (remaining <= monthly * 0.08 || usedRatio >= 0.95) {
    health = "over";
    frugalBias = 0.92;
    weekendFraction = 0.15;
  } else if (remaining <= monthly * 0.25 || weekRatio >= 1.3) {
    health = "tight";
    frugalBias = 0.62;
    weekendFraction = 0.25;
  } else if (remaining <= monthly * 0.5) {
    health = "ok";
    frugalBias = 0.28;
    weekendFraction = 0.3;
  } else {
    health = "great";
    frugalBias = 0.05;
    weekendFraction = 0.35;
  }

  // 주말 권장 예산 = 남은 예산의 일정 비율 (하루 권장의 2.5배 이내)
  let weekendBudget = roundTo(
    Math.min(remaining * weekendFraction, dailySafe * 2.5),
    1000
  );
  weekendBudget = Math.min(weekendBudget, remaining);

  if (health === "over") {
    headline = `남은 예산이 ${wonShort(remaining)}, 이번엔 아껴볼까요?`;
    detail = "무료 전시·공원·산책·팝업 위주의 저비용 코스를 우선 추천할게요.";
  } else if (health === "tight") {
    headline = `이번 주말은 최대 ${wonShort(weekendBudget)} 사용을 추천해요.`;
    detail =
      weekRatio >= 1.3
        ? "이번 주 지출이 평소보다 많아 가성비 코스를 먼저 보여드릴게요."
        : "남은 예산을 고려해 합리적인 코스를 우선 추천할게요.";
  } else if (health === "ok") {
    headline = `이번 주말 ${wonShort(weekendBudget)} 정도가 적당해요.`;
    detail = "예산 페이스가 안정적이에요. 만족도 높은 코스를 추천할게요.";
  } else {
    headline = `예산 여유가 ${wonShort(remaining)}, 다양하게 즐겨도 좋아요.`;
    detail = "이번 달은 페이스가 좋아요. 평소보다 다채로운 경험을 추천할게요.";
  }

  return {
    remaining,
    weekendBudget,
    dailySafe,
    health,
    frugalBias,
    headline,
    detail,
  };
}

export const HEALTH_META: Record<
  SpendHealth,
  { label: string; tone: string; ring: string; text: string }
> = {
  great: { label: "여유", tone: "bg-mint-soft", ring: "stroke-mint", text: "text-mint" },
  ok: { label: "안정", tone: "bg-brand-soft", ring: "stroke-brand", text: "text-brand" },
  tight: { label: "주의", tone: "bg-amber-50", ring: "stroke-gold", text: "text-gold" },
  over: { label: "초과 임박", tone: "bg-rose-50", ring: "stroke-rose-500", text: "text-rose-500" },
};

export function spendLine(budget: BudgetState): string {
  const remaining = Math.max(0, budget.monthly - budget.spent);
  return `이번 달 ${won(budget.monthly)} 중 ${won(budget.spent)} 사용 · 남은 ${won(remaining)}`;
}

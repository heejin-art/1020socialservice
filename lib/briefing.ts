import type { Briefing, BudgetState, Context } from "./types";
import { getCoach } from "./coach";
import { wonShort } from "./format";

interface BriefingInput {
  budget: BudgetState;
  context: Context;
  savedPopup?: { title: string } | null;
  daysLeft?: number;
}

/**
 * 오늘의 AI 브리핑 — 사용자가 검색하지 않아도 AI가 먼저 제안한다.
 * 날씨 · 예산 · 저장한 팝업 · 시간대 등을 종합해 우선순위로 노출.
 */
export function generateBriefings({
  budget,
  context,
  savedPopup,
  daysLeft = 10,
}: BriefingInput): Briefing[] {
  const out: Briefing[] = [];
  const coach = getCoach(budget, daysLeft);
  const h = Math.floor(context.nowMin / 60);

  // 1) 날씨
  if (context.weather === "rain") {
    out.push({
      kind: "weather",
      emoji: "🌧️",
      title: "오늘은 비가 와요",
      body: "젖지 않고 즐길 수 있는 실내 코스를 추천드릴게요.",
      cta: { label: "실내 코스 보기", href: "/plan?setting=indoor" },
      tone: "info",
    });
  } else if (context.weather === "hot") {
    out.push({
      kind: "weather",
      emoji: "☀️",
      title: `오늘 ${context.temp}°C, 무더워요`,
      body: "시원한 실내 위주로 코스를 구성해드릴게요.",
      cta: { label: "코스 설계", href: "/plan?setting=indoor" },
      tone: "info",
    });
  } else {
    out.push({
      kind: "weather",
      emoji: "🌤️",
      title: "야외 활동하기 좋은 날이에요",
      body: "산책·한강 코스를 함께 추천드릴게요.",
      cta: { label: "야외 코스 보기", href: "/plan?setting=outdoor" },
      tone: "good",
    });
  }

  // 2) 예산 (코치)
  if (coach.health === "over" || coach.health === "tight") {
    out.push({
      kind: "budget",
      emoji: "💰",
      title:
        coach.health === "over"
          ? "이번 달 예산이 얼마 남지 않았어요"
          : `남은 예산 ${wonShort(coach.remaining)}`,
      body:
        coach.health === "over"
          ? "무료 전시·공원 위주의 저비용 코스를 우선 추천할게요."
          : coach.detail,
      cta: { label: "가성비 코스 보기", href: "/plan" },
      tone: "warn",
    });
  } else if (coach.health === "great") {
    out.push({
      kind: "budget",
      emoji: "✨",
      title: "이번 달은 예산 여유가 있어요",
      body: "평소보다 다양한 경험을 추천드릴게요.",
      cta: { label: "추천 받기", href: "/plan" },
      tone: "good",
    });
  }

  // 3) 저장한 팝업 마감 임박
  if (savedPopup) {
    out.push({
      kind: "popup",
      emoji: "⏰",
      title: `저장한 '${savedPopup.title}'`,
      body: "오늘이 마지막 운영일이에요. 일정에 넣어볼까요?",
      cta: { label: "코스에 넣기", href: "/explore" },
      tone: "warn",
    });
  }

  // 4) 시간대 (퇴근/식사)
  if (h >= 17 && h <= 20) {
    out.push({
      kind: "time",
      emoji: "🍽️",
      title: "퇴근·저녁 시간이 가까워요",
      body: "주변에서 바로 갈 수 있는 맛집을 함께 추천드릴게요.",
      cta: { label: "저녁 코스 보기", href: "/plan" },
      tone: "info",
    });
  } else if (h >= 10 && h <= 13) {
    out.push({
      kind: "time",
      emoji: "🥐",
      title: "브런치 즐기기 좋은 시간이에요",
      body: "오전부터 시작하는 하루 코스를 추천드릴게요.",
      cta: { label: "코스 설계", href: "/plan" },
      tone: "info",
    });
  }

  return out;
}

export function leadBriefing(b: Briefing[]): Briefing | null {
  // 경고(예산/팝업) > 정보 순으로 대표 브리핑 선택
  return (
    b.find((x) => x.tone === "warn") ?? b.find((x) => x.kind === "weather") ?? b[0] ?? null
  );
}

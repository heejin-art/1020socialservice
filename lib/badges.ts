import type { Badge } from "./types";

export interface GameStats {
  created: number; // 생성한 코스 수
  cheapRuns: number; // 1만원 이하로 다녀온 횟수
  dateRuns: number; // 3만원 데이트 완주 수
  shares: number; // 공유 수
  underBudgetWeeks: number; // 예산 내로 보낸 주
  saves: number; // 저장 수
}

export function emptyStats(): GameStats {
  return { created: 0, cheapRuns: 0, dateRuns: 0, shares: 0, underBudgetWeeks: 0, saves: 0 };
}

export function computeBadges(s: GameStats): Badge[] {
  return [
    {
      id: "challenge-10k",
      title: "1만원 챌린지",
      desc: "1만원 이하 코스를 3번 완주하기",
      emoji: "🪙",
      progress: Math.min(s.cheapRuns, 3),
      goal: 3,
      reward: "가성비 탐험가 타이틀",
    },
    {
      id: "date-30k",
      title: "3만원 데이트",
      desc: "3만원 이하 데이트 코스 5회 완주",
      emoji: "💞",
      progress: Math.min(s.dateRuns, 5),
      goal: 5,
      reward: "데이트 마스터 배지",
    },
    {
      id: "saver-king",
      title: "이번 달 절약왕",
      desc: "예산 안에서 4주 연속 보내기",
      emoji: "👑",
      progress: Math.min(s.underBudgetWeeks, 4),
      goal: 4,
      reward: "프리미엄 1개월 무료",
    },
    {
      id: "explorer",
      title: "가성비 탐험가",
      desc: "서로 다른 지역 코스 6개 만들기",
      emoji: "🧭",
      progress: Math.min(s.created, 6),
      goal: 6,
      reward: "탐험가 프로필 프레임",
    },
    {
      id: "sharer",
      title: "코스 크리에이터",
      desc: "내 코스 3개 공유하기",
      emoji: "📣",
      progress: Math.min(s.shares, 3),
      goal: 3,
      reward: "크리에이터 인증 마크",
    },
    {
      id: "collector",
      title: "코스 컬렉터",
      desc: "마음에 드는 코스 10개 저장",
      emoji: "📚",
      progress: Math.min(s.saves, 10),
      goal: 10,
      reward: "컬렉터 배지",
    },
  ];
}

export function badgeDone(b: Badge): boolean {
  return b.progress >= b.goal;
}

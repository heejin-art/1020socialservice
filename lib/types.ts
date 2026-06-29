// ───────────────────────── Domain types ─────────────────────────

export type Companion = "solo" | "friend" | "couple" | "family";
export type Vibe = "trendy" | "calm" | "active" | "foodie" | "culture";
export type Setting = "indoor" | "outdoor" | "any";

export type PlaceCategory =
  | "cafe"
  | "food"
  | "dessert"
  | "culture" // 전시/팝업/체험
  | "activity" // 액티비티/놀거리
  | "walk" // 산책/뷰/공원
  | "shopping"
  | "bar";

export interface Place {
  id: string;
  name: string;
  area: string; // 성수, 연남, 한강 ...
  category: PlaceCategory;
  /** 1인 기준 예상 지출 (원). 0 = 무료 */
  cost: number;
  /** 평균 체류 시간(분) */
  duration: number;
  rating: number; // 0~5
  /** 어울리는 동행 */
  companions: Companion[];
  vibes: Vibe[];
  setting: "indoor" | "outdoor";
  /** 추천 시간대 시작 (24h). 코스 순서 정렬에 사용 */
  bestStart: number;
  tags: string[];
  /** 실시간성 시그널 (mock) */
  signal?: {
    discount?: number; // % 할인
    popup?: boolean; // 팝업스토어
    free?: boolean; // 무료 전시/행사
    crowd?: "low" | "mid" | "high"; // 혼잡도
  };
  blurb: string; // 한 줄 소개
  emoji: string;
}

export interface CourseStop {
  place: Place;
  /** 코스 내 시작 시각 (분 단위, 자정 기준) */
  startMin: number;
  reason: string; // AI가 고른 이유 (한 줄)
}

export interface PlanInput {
  budget: number;
  companion: Companion;
  area: string; // "auto" = 현재 위치(데모)
  vibes: Vibe[];
  setting: Setting;
  startMin: number; // 시작 시간 (분)
}

export interface GeneratedCourse {
  id: string;
  input: PlanInput;
  stops: CourseStop[];
  totalCost: number;
  /** 0~100 만족도 점수 (AI 예측) */
  satisfaction: number;
  /** 예산 사용률 0~1 */
  budgetUsed: number;
  area: string;
  durationMin: number;
  highlights: string[]; // 코스의 차별점 시그널
}

// ─────────────────── Social / community course ───────────────────

export interface Author {
  name: string;
  handle: string;
  avatar: string; // emoji
}

export interface SocialCourse {
  id: string;
  title: string;
  budget: number;
  area: string;
  companion: Companion;
  author: Author;
  cover: string; // gradient key
  stops: { name: string; cost: number; category: PlaceCategory; emoji: string }[];
  likes: number;
  saves: number;
  rating: number;
  reviews: number;
  totalCost: number;
  tags: string[];
  createdLabel: string;
}

// ───────────── AI 생활비 코치 (Budget Coach) ─────────────

export interface BudgetState {
  monthly: number; // 이번 달 생활비
  spent: number; // 현재 사용 금액
  /** 이번 주 사용 금액 (과소비 판단용) */
  weekSpent: number;
}

export type SpendHealth = "great" | "ok" | "tight" | "over";

export interface CoachAdvice {
  remaining: number; // 남은 예산
  weekendBudget: number; // AI가 추천하는 이번 주말 예산
  dailySafe: number; // 남은 기간 하루 권장 지출
  health: SpendHealth;
  /** 코스 점수에서 저비용을 얼마나 우대할지 0~1 */
  frugalBias: number;
  headline: string;
  detail: string;
}

// ───────────── AI 개인화 학습 (Personalization) ─────────────

export interface PrefProfile {
  /** 카테고리 친밀도 (행동으로 누적) */
  category: Partial<Record<PlaceCategory, number>>;
  /** 실내/야외 성향 (-1 야외 ~ +1 실내) */
  indoorLean: number;
  /** 동행 성향 카운트 */
  companion: Partial<Record<Companion, number>>;
  /** vibe 친밀도 */
  vibe: Partial<Record<Vibe, number>>;
  /** 활동 시간대 성향 (오전/오후/저녁 카운트) */
  daypart: { morning: number; afternoon: number; evening: number };
  /** 저장한 팝업 수 등 신호 */
  savedPopups: number;
  /** 총 학습 이벤트 수 */
  events: number;
}

export interface LearnedSignal {
  label: string;
  emoji: string;
  strength: number; // 0~1
}

// ───────────── 오늘의 AI 브리핑 ─────────────

export type BriefingKind = "weather" | "budget" | "popup" | "time" | "social" | "streak";

export interface Briefing {
  kind: BriefingKind;
  emoji: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  tone: "info" | "warn" | "good";
}

// ───────────── 게이미피케이션 (배지/미션) ─────────────

export interface Badge {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  /** 현재 진행값 */
  progress: number;
  goal: number;
  reward: string;
}

// ───────────── 소셜 실데이터 랭킹 ─────────────

export interface RankingBoard {
  id: string;
  segment: string; // "20대 여성 · 혼자 · 2만원 이하"
  metricLabel: string; // "만족도" | "평균 평점"
  courses: SocialCourse[];
}

// 환경(데모): 날씨/시간 — 브리핑·엔진 입력
export interface Context {
  weather: "clear" | "rain" | "cloudy" | "hot";
  nowMin: number; // 현재 시각(분)
  temp: number;
}


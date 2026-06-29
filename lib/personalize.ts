import type {
  Companion,
  LearnedSignal,
  PlaceCategory,
  PlanInput,
  PrefProfile,
  Vibe,
} from "./types";
import { clamp } from "./format";

export function emptyProfile(): PrefProfile {
  return {
    category: {},
    indoorLean: 0,
    companion: {},
    vibe: {},
    daypart: { morning: 0, afternoon: 0, evening: 0 },
    savedPopups: 0,
    events: 0,
  };
}

function bump<T extends string>(
  rec: Partial<Record<T, number>>,
  key: T,
  by = 1
) {
  rec[key] = (rec[key] ?? 0) + by;
}

function daypartOf(min: number): "morning" | "afternoon" | "evening" {
  const h = Math.floor(min / 60);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

/** 코스를 생성할 때 학습 */
export function learnFromPlan(p: PrefProfile, input: PlanInput): PrefProfile {
  const next: PrefProfile = structuredClone(p);
  input.vibes.forEach((v) => bump(next.vibe, v, 1));
  bump(next.companion, input.companion, 1);
  if (input.setting === "indoor") next.indoorLean = clamp(next.indoorLean + 0.15, -1, 1);
  if (input.setting === "outdoor") next.indoorLean = clamp(next.indoorLean - 0.15, -1, 1);
  next.daypart[daypartOf(input.startMin)] += 1;
  next.events += 1;
  return next;
}

/** 장소/코스를 저장·좋아요할 때 학습 */
export function learnFromAction(
  p: PrefProfile,
  opts: { category?: PlaceCategory; isPopup?: boolean; setting?: "indoor" | "outdoor"; weight?: number }
): PrefProfile {
  const next: PrefProfile = structuredClone(p);
  const w = opts.weight ?? 1;
  if (opts.category) bump(next.category, opts.category, w);
  if (opts.isPopup) next.savedPopups += 1;
  if (opts.setting === "indoor") next.indoorLean = clamp(next.indoorLean + 0.08 * w, -1, 1);
  if (opts.setting === "outdoor") next.indoorLean = clamp(next.indoorLean - 0.08 * w, -1, 1);
  next.events += 1;
  return next;
}

const CATEGORY_LABEL: Record<PlaceCategory, { label: string; emoji: string }> = {
  cafe: { label: "카페를 자주 찾아요", emoji: "☕" },
  food: { label: "맛집 탐방을 즐겨요", emoji: "🍽️" },
  dessert: { label: "디저트를 좋아해요", emoji: "🍰" },
  culture: { label: "전시·팝업을 오래 봐요", emoji: "🖼️" },
  activity: { label: "액티비티를 즐겨요", emoji: "🎯" },
  walk: { label: "산책·뷰를 좋아해요", emoji: "🌳" },
  shopping: { label: "쇼핑·구경을 즐겨요", emoji: "🛍️" },
  bar: { label: "분위기 있는 바를 선호해요", emoji: "🍸" },
};

const VIBE_LABEL: Record<Vibe, { label: string; emoji: string }> = {
  trendy: { label: "트렌디한 곳을 선호해요", emoji: "✨" },
  calm: { label: "조용한 분위기를 좋아해요", emoji: "🍃" },
  active: { label: "활동적인 코스를 즐겨요", emoji: "⚡" },
  foodie: { label: "먹는 즐거움을 중시해요", emoji: "😋" },
  culture: { label: "문화·예술에 관심이 많아요", emoji: "🎨" },
};

const COMPANION_LABEL: Record<Companion, { label: string; emoji: string }> = {
  solo: { label: "혼자 노는 걸 좋아해요", emoji: "🧘" },
  friend: { label: "친구와 자주 다녀요", emoji: "👯" },
  couple: { label: "데이트 코스를 자주 봐요", emoji: "💑" },
  family: { label: "가족과 함께 즐겨요", emoji: "👨‍👩‍👧" },
};

function topKey<T extends string>(rec: Partial<Record<T, number>>): [T, number] | null {
  const entries = Object.entries(rec) as [T, number][];
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0] : null;
}

/** 학습된 취향을 사람이 읽을 수 있는 시그널로 변환 */
export function deriveSignals(p: PrefProfile): LearnedSignal[] {
  const out: LearnedSignal[] = [];
  const maxCat = Math.max(1, ...Object.values(p.category));

  const cat = topKey(p.category);
  if (cat) out.push({ ...CATEGORY_LABEL[cat[0]], strength: clamp(cat[1] / maxCat, 0.3, 1) });

  const vibe = topKey(p.vibe);
  if (vibe) out.push({ ...VIBE_LABEL[vibe[0]], strength: clamp(vibe[1] / 4, 0.3, 1) });

  const comp = topKey(p.companion);
  if (comp) out.push({ ...COMPANION_LABEL[comp[0]], strength: clamp(comp[1] / 4, 0.3, 1) });

  if (Math.abs(p.indoorLean) > 0.2) {
    out.push(
      p.indoorLean > 0
        ? { label: "실내 코스를 선호해요", emoji: "🏠", strength: clamp(p.indoorLean, 0.3, 1) }
        : { label: "야외 활동을 선호해요", emoji: "🌤️", strength: clamp(-p.indoorLean, 0.3, 1) }
    );
  }

  const dp = p.daypart;
  const dpMax = Math.max(dp.morning, dp.afternoon, dp.evening);
  if (dpMax > 0) {
    const which =
      dpMax === dp.evening ? ["저녁 활동이 많아요", "🌙"] : dpMax === dp.afternoon ? ["오후 활동이 많아요", "🌇"] : ["오전형이에요", "🌅"];
    out.push({ label: which[0], emoji: which[1], strength: clamp(dpMax / 5, 0.3, 1) });
  }

  if (p.savedPopups >= 2) {
    out.push({ label: "팝업스토어를 자주 저장해요", emoji: "🎁", strength: clamp(p.savedPopups / 5, 0.4, 1) });
  }

  return out.slice(0, 6);
}

export function accuracyScore(p: PrefProfile): number {
  // 학습 이벤트가 쌓일수록 추천 정확도가 올라가는 것을 시각화 (62% → 96%)
  return Math.round(62 + clamp(p.events / 14, 0, 1) * 34);
}

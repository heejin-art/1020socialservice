import type {
  Context,
  CourseStop,
  GeneratedCourse,
  Place,
  PlanInput,
  PrefProfile,
} from "./types";
import { AREAS, placesByArea } from "./places";
import { clamp, seeded } from "./format";

const TRAVEL_MIN = 20; // 이동 버퍼

interface EngineOpts {
  profile?: PrefProfile;
  frugalBias?: number; // 0~1 (생활비 코치)
  context?: Context;
  seed?: number;
}

/** 장소의 기본 매력도(비용 제외) — 취향/시그널/맥락 반영 */
function desirability(place: Place, input: PlanInput, opts: EngineOpts): number {
  let s = place.rating * 1.4; // 0~7

  // 동행 적합도
  if (place.companions.includes(input.companion)) s += 1.6;
  else s -= 1.4;

  // 분위기 매칭
  const vibeHit = place.vibes.filter((v) => input.vibes.includes(v)).length;
  s += vibeHit * 0.9;

  // 실내/야외 선호
  if (input.setting !== "any") {
    s += place.setting === input.setting ? 0.8 : -1.0;
  }

  // 실시간 시그널
  const sig = place.signal;
  if (sig) {
    if (sig.discount) s += clamp(sig.discount / 20, 0, 1.2);
    if (sig.popup) s += 0.9;
    if (sig.free) s += 0.6;
    if (sig.crowd === "low") s += 0.5;
    if (sig.crowd === "high") s -= 0.4;
  }

  // 맥락(날씨) — 비/더위면 실내 가산
  const w = opts.context?.weather;
  if (w === "rain" || w === "hot") {
    s += place.setting === "indoor" ? 0.8 : -0.8;
  }

  // 개인화 학습 반영
  const prof = opts.profile;
  if (prof) {
    const catAff = prof.category[place.category] ?? 0;
    s += clamp(catAff * 0.25, 0, 1.5);
    const vibeAff = place.vibes.reduce((a, v) => a + (prof.vibe[v] ?? 0), 0);
    s += clamp(vibeAff * 0.12, 0, 1.2);
    if (prof.indoorLean > 0 && place.setting === "indoor") s += prof.indoorLean * 0.8;
    if (prof.indoorLean < 0 && place.setting === "outdoor") s += -prof.indoorLean * 0.8;
    if (place.signal?.popup && prof.savedPopups >= 2) s += 0.7;
  }

  return s;
}

function reasonFor(place: Place, input: PlanInput, opts: EngineOpts): string {
  const sig = place.signal;
  if (sig?.discount) return `지금 ${sig.discount}% 할인 중이라 가성비가 좋아요`;
  if (sig?.popup) return `오늘 운영 중인 팝업, 지금 방문하기 좋아요`;
  if (sig?.free && place.cost === 0) return `무료라 예산 부담 없이 즐기기 좋아요`;
  if (opts.context?.weather === "rain" && place.setting === "indoor")
    return `비 오는 날 딱 좋은 실내 코스예요`;
  const vibeHit = place.vibes.find((v) => input.vibes.includes(v));
  if (vibeHit) {
    const map: Record<string, string> = {
      trendy: "요즘 뜨는 트렌디한 곳이에요",
      calm: "조용하게 쉬어가기 좋아요",
      active: "활동적으로 즐기기 좋아요",
      foodie: "맛으로 유명한 곳이에요",
      culture: "문화 경험을 채우기 좋아요",
    };
    return map[vibeHit];
  }
  if (place.rating >= 4.6) return `평점 ${place.rating}의 검증된 장소예요`;
  return `${input.companion === "solo" ? "혼자" : "함께"} 가기 좋은 코스예요`;
}

export function generateCourse(input: PlanInput, opts: EngineOpts = {}): GeneratedCourse {
  const frugal = clamp(opts.frugalBias ?? 0, 0, 1);
  const rnd = seeded(opts.seed ?? 7);

  // '현재 위치(auto)'면 취향·동행에 가장 잘 맞는 단일 상권을 선택해 동선 일관성을 확보
  let area = input.area;
  if (area === "auto") {
    let best = AREAS[0] as string;
    let bestScore = -Infinity;
    for (const a of AREAS) {
      const top = placesByArea(a)
        .map((p) => desirability(p, input, opts))
        .sort((x, y) => y - x)
        .slice(0, 4)
        .reduce((s, v) => s + v, 0);
      const sc = top + (rnd() - 0.5);
      if (sc > bestScore) {
        bestScore = sc;
        best = a;
      }
    }
    area = best;
  }

  let pool = placesByArea(area);
  if (pool.length < 4) pool = placesByArea("auto");

  // 목표 스탑 수 — 예산이 작을수록 적게
  const target =
    input.budget < 12000 ? 3 : input.budget < 25000 ? 3 : input.budget < 45000 ? 4 : 4;

  // 각 장소 점수 계산 + 약간의 시드 변동(재생성 다양성)
  const scored = pool.map((p) => {
    const base = desirability(p, input, opts);
    const jitter = (rnd() - 0.5) * 0.8;
    // 비용 패널티: frugalBias가 높을수록 비싼 곳을 더 깎음(단, 예산은 활용하도록 완만하게)
    const costPenalty = (p.cost / 10000) * (0.25 + frugal * 1.0);
    return { p, value: base, eff: base + jitter - costPenalty };
  });
  scored.sort((a, b) => b.eff - a.eff);

  // 그리디 조립: 예산/카테고리 다양성/스탑수 제약
  const chosen: { p: Place; value: number }[] = [];
  const catCount: Record<string, number> = {};
  let total = 0;
  const limit = input.budget * 1.04; // 약간의 초과 허용

  for (const s of scored) {
    if (chosen.length >= target) break;
    const c = s.p.cost;
    if (total + c > limit) continue;
    if ((catCount[s.p.category] ?? 0) >= (s.p.cost === 0 ? 2 : 1)) continue;
    chosen.push({ p: s.p, value: s.value });
    catCount[s.p.category] = (catCount[s.p.category] ?? 0) + 1;
    total += c;
  }

  // 너무 적게 뽑혔으면 무료/저가로 채우기
  if (chosen.length < Math.min(2, target)) {
    for (const s of scored) {
      if (chosen.length >= target) break;
      if (chosen.find((x) => x.p.id === s.p.id)) continue;
      if (total + s.p.cost > limit) continue;
      chosen.push({ p: s.p, value: s.value });
      total += s.p.cost;
    }
  }

  // 예산 활용 보강: 절약 모드가 아닌데 예산을 너무 적게 쓰면 가치 높은 유료 코스를 추가
  if (frugal < 0.6) {
    const maxStops = target + 1;
    while (chosen.length < maxStops && total < input.budget * 0.6) {
      const cand = scored.find(
        (s) =>
          s.p.cost > 0 &&
          total + s.p.cost <= limit &&
          (catCount[s.p.category] ?? 0) < 1 &&
          !chosen.find((c) => c.p.id === s.p.id)
      );
      if (!cand) break;
      chosen.push({ p: cand.p, value: cand.value });
      catCount[cand.p.category] = (catCount[cand.p.category] ?? 0) + 1;
      total += cand.p.cost;
    }
  }

  // 시간 순서대로 정렬 후 타임라인 배치
  chosen.sort((a, b) => a.p.bestStart - b.p.bestStart);
  let cursor = input.startMin;
  const stops: CourseStop[] = chosen.map(({ p }) => {
    const stop: CourseStop = {
      place: p,
      startMin: cursor,
      reason: reasonFor(p, input, opts),
    };
    cursor += p.duration + TRAVEL_MIN;
    return stop;
  });

  const totalCost = stops.reduce((a, s) => a + s.place.cost, 0);
  const durationMin = stops.reduce((a, s) => a + s.place.duration, 0);
  const avgValue = chosen.length
    ? chosen.reduce((a, c) => a + c.value, 0) / chosen.length
    : 0;

  // 만족도 점수 산출
  const budgetUsed = input.budget > 0 ? totalCost / input.budget : 0;
  // 예산을 80~100% 활용하면 가장 만족(단, frugal 상황이면 적게 써도 OK)
  const fitTarget = frugal > 0.5 ? 0.55 : 0.9;
  const fitScore = 1 - clamp(Math.abs(budgetUsed - fitTarget) / 0.9, 0, 1);
  const signalRich = stops.filter((s) => s.place.signal).length / Math.max(1, stops.length);

  const satisfaction = Math.round(
    clamp(
      72 +
        clamp(avgValue, 0, 12) * 1.4 +
        fitScore * 8 +
        signalRich * 4 +
        (opts.profile ? clamp(opts.profile.events / 14, 0, 1) * 3 : 0),
      70,
      98
    )
  );

  // 하이라이트(차별점) 수집
  const highlights: string[] = [];
  const discount = stops.find((s) => s.place.signal?.discount);
  if (discount) highlights.push(`실시간 할인 ${discount.place.signal!.discount}% 반영`);
  if (stops.some((s) => s.place.signal?.popup)) highlights.push("운영 중인 팝업 포함");
  const freeCount = stops.filter((s) => s.place.cost === 0).length;
  if (freeCount) highlights.push(`무료 코스 ${freeCount}곳`);
  if (opts.context?.weather === "rain") highlights.push("비 예보 반영(실내 우선)");
  if (frugal > 0.5) highlights.push("생활비 코치: 가성비 우선");
  if (opts.profile && opts.profile.events > 2) highlights.push("내 취향 학습 반영");

  return {
    id: `gen-${input.budget}-${input.area}-${opts.seed ?? 7}`,
    input,
    stops,
    totalCost,
    satisfaction,
    budgetUsed: clamp(budgetUsed, 0, 1.2),
    area,
    durationMin,
    highlights: highlights.slice(0, 4),
  };
}

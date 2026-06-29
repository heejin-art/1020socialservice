"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Badge,
  BudgetState,
  CoachAdvice,
  Context as EnvContext,
  GeneratedCourse,
  LearnedSignal,
  PlanInput,
  PrefProfile,
  SocialCourse,
} from "./types";
import { emptyProfile, learnFromAction, learnFromPlan, deriveSignals, accuracyScore } from "./personalize";
import { getCoach } from "./coach";
import { computeBadges, emptyStats, type GameStats } from "./badges";
import { hashString } from "./format";

const KEY = "moneycourse:v1";

interface Persisted {
  budget: BudgetState;
  profile: PrefProfile;
  savedIds: string[];
  likedIds: string[];
  myCourses: GeneratedCourse[];
  stats: GameStats;
  onboarded: boolean;
}

function defaults(): Persisted {
  return {
    // 사용자 예시값: 이번 달 50만 / 사용 38만 / 남은 12만
    budget: { monthly: 500000, spent: 380000, weekSpent: 95000 },
    profile: emptyProfile(),
    savedIds: [],
    likedIds: [],
    myCourses: [],
    stats: emptyStats(),
    onboarded: false,
  };
}

interface StoreValue extends Persisted {
  hydrated: boolean;
  env: EnvContext;
  daysLeft: number;
  coach: CoachAdvice;
  signals: LearnedSignal[];
  accuracy: number;
  badges: Badge[];
  // actions
  setBudget: (b: Partial<BudgetState>) => void;
  addSpent: (amount: number) => void;
  completeOnboarding: () => void;
  registerPlan: (input: PlanInput) => void;
  isSaved: (id: string) => boolean;
  toggleSaveSocial: (c: SocialCourse) => void;
  isLiked: (id: string) => boolean;
  toggleLikeSocial: (c: SocialCourse) => void;
  saveGenerated: (c: GeneratedCourse) => void;
  removeGenerated: (id: string) => void;
  isGeneratedSaved: (id: string) => boolean;
  runCourse: (info: { totalCost: number; couple: boolean; categories: string[] }) => void;
  recordShare: () => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreValue | null>(null);

// 데모 환경(날씨/시간) — 결정론적으로 '오늘'을 구성
function buildEnv(): EnvContext {
  if (typeof window === "undefined") {
    return { weather: "rain", nowMin: 11 * 60, temp: 19 };
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // 날짜 기반 의사 날씨 (데모) — 매일 달라지되 그날은 고정
  const seed = hashString(now.toDateString());
  const weathers: EnvContext["weather"][] = ["clear", "rain", "cloudy", "hot"];
  const weather = weathers[seed % weathers.length];
  const temp = weather === "hot" ? 31 : weather === "rain" ? 19 : 24;
  return { weather, nowMin, temp };
}

function daysLeftInMonth(): number {
  if (typeof window === "undefined") return 10;
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, end - now.getDate());
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [env, setEnv] = useState<EnvContext>(() => buildEnv());
  const [daysLeft, setDaysLeft] = useState(10);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState((s) => ({ ...s, ...parsed, profile: { ...emptyProfile(), ...parsed.profile } }));
      }
    } catch {}
    setEnv(buildEnv());
    setDaysLeft(daysLeftInMonth());
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: Persisted) => Persisted) => setState(fn), []);

  const setBudget = useCallback(
    (b: Partial<BudgetState>) => patch((s) => ({ ...s, budget: { ...s.budget, ...b } })),
    [patch]
  );

  const addSpent = useCallback(
    (amount: number) =>
      patch((s) => ({
        ...s,
        budget: { ...s.budget, spent: s.budget.spent + amount, weekSpent: s.budget.weekSpent + amount },
      })),
    [patch]
  );

  const completeOnboarding = useCallback(() => patch((s) => ({ ...s, onboarded: true })), [patch]);

  const registerPlan = useCallback(
    (input: PlanInput) =>
      patch((s) => ({
        ...s,
        profile: learnFromPlan(s.profile, input),
        stats: { ...s.stats, created: s.stats.created + 1 },
      })),
    [patch]
  );

  const isSaved = useCallback((id: string) => state.savedIds.includes(id), [state.savedIds]);

  const toggleSaveSocial = useCallback(
    (c: SocialCourse) =>
      patch((s) => {
        const has = s.savedIds.includes(c.id);
        if (has) return { ...s, savedIds: s.savedIds.filter((x) => x !== c.id) };
        const topCat = c.stops[0]?.category;
        return {
          ...s,
          savedIds: [c.id, ...s.savedIds],
          stats: { ...s.stats, saves: s.stats.saves + 1 },
          profile: learnFromAction(s.profile, {
            category: topCat,
            isPopup: c.tags.includes("팝업"),
            weight: 1.4,
          }),
        };
      }),
    [patch]
  );

  const isLiked = useCallback((id: string) => state.likedIds.includes(id), [state.likedIds]);

  const toggleLikeSocial = useCallback(
    (c: SocialCourse) =>
      patch((s) => {
        const has = s.likedIds.includes(c.id);
        if (has) return { ...s, likedIds: s.likedIds.filter((x) => x !== c.id) };
        return {
          ...s,
          likedIds: [c.id, ...s.likedIds],
          profile: learnFromAction(s.profile, { category: c.stops[0]?.category, weight: 0.8 }),
        };
      }),
    [patch]
  );

  const saveGenerated = useCallback(
    (c: GeneratedCourse) =>
      patch((s) => {
        if (s.myCourses.find((x) => x.id === c.id))
          return { ...s, myCourses: s.myCourses.filter((x) => x.id !== c.id) };
        let profile = s.profile;
        c.stops.forEach((st) => {
          profile = learnFromAction(profile, {
            category: st.place.category,
            setting: st.place.setting,
            isPopup: !!st.place.signal?.popup,
            weight: 0.6,
          });
        });
        return {
          ...s,
          myCourses: [c, ...s.myCourses],
          stats: { ...s.stats, saves: s.stats.saves + 1 },
          profile,
        };
      }),
    [patch]
  );

  const removeGenerated = useCallback(
    (id: string) => patch((s) => ({ ...s, myCourses: s.myCourses.filter((x) => x.id !== id) })),
    [patch]
  );

  const isGeneratedSaved = useCallback(
    (id: string) => state.myCourses.some((x) => x.id === id),
    [state.myCourses]
  );

  const runCourse = useCallback(
    (info: { totalCost: number; couple: boolean; categories: string[] }) =>
      patch((s) => {
        let profile = s.profile;
        info.categories.forEach((cat) => {
          profile = learnFromAction(profile, { category: cat as never, weight: 1.2 });
        });
        return {
          ...s,
          budget: {
            ...s.budget,
            spent: s.budget.spent + info.totalCost,
            weekSpent: s.budget.weekSpent + info.totalCost,
          },
          profile,
          stats: {
            ...s.stats,
            cheapRuns: info.totalCost <= 10000 ? s.stats.cheapRuns + 1 : s.stats.cheapRuns,
            dateRuns:
              info.couple && info.totalCost <= 30000 ? s.stats.dateRuns + 1 : s.stats.dateRuns,
          },
        };
      }),
    [patch]
  );

  const recordShare = useCallback(
    () => patch((s) => ({ ...s, stats: { ...s.stats, shares: s.stats.shares + 1 } })),
    [patch]
  );

  const resetAll = useCallback(() => {
    setState(defaults());
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);

  const coach = useMemo(() => getCoach(state.budget, daysLeft), [state.budget, daysLeft]);
  const signals = useMemo(() => deriveSignals(state.profile), [state.profile]);
  const accuracy = useMemo(() => accuracyScore(state.profile), [state.profile]);
  const badges = useMemo(() => computeBadges(state.stats), [state.stats]);

  const value: StoreValue = {
    ...state,
    hydrated,
    env,
    daysLeft,
    coach,
    signals,
    accuracy,
    badges,
    setBudget,
    addSpent,
    completeOnboarding,
    registerPlan,
    isSaved,
    toggleSaveSocial,
    isLiked,
    toggleLikeSocial,
    saveGenerated,
    removeGenerated,
    isGeneratedSaved,
    runCourse,
    recordShare,
    resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}

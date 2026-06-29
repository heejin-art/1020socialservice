import Link from "next/link";
import {
  ArrowRight,
  SparkleIcon,
  WalletIcon,
  RouteIcon,
  UsersIcon,
  TrendIcon,
  CloudIcon,
  StarIcon,
} from "@/components/icons";

const FEATURES = [
  {
    Icon: WalletIcon,
    title: "AI 생활비 코치",
    desc: "남은 생활비를 분석해 이번 주말 적정 예산을 먼저 제안해요.",
    tint: "bg-mint-soft text-mint",
  },
  {
    Icon: SparkleIcon,
    title: "오늘의 AI 브리핑",
    desc: "검색하지 않아도 날씨·예산·일정을 보고 AI가 먼저 추천해요.",
    tint: "bg-brand-soft text-brand",
  },
  {
    Icon: RouteIcon,
    title: "10초 코스 설계",
    desc: "예산과 동행만 고르면 하루 코스가 타임라인으로 완성돼요.",
    tint: "bg-violet-50 text-violet-600",
  },
  {
    Icon: UsersIcon,
    title: "실데이터 소셜 랭킹",
    desc: "또래가 실제로 만족한 예산 코스 TOP을 그대로 따라가요.",
    tint: "bg-amber-50 text-gold",
  },
  {
    Icon: TrendIcon,
    title: "개인화 학습",
    desc: "쓸수록 취향을 학습해 추천 정확도가 계속 올라가요.",
    tint: "bg-rose-50 text-rose-500",
  },
  {
    Icon: StarIcon,
    title: "챌린지 · 배지",
    desc: "1만원 챌린지·절약왕 미션으로 즐기며 절약해요.",
    tint: "bg-sky-50 text-sky-600",
  },
];

export default function Landing() {
  return (
    <main className="app-shell pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-safe">
        <div className="absolute inset-0 mesh-brand" />
        <div className="relative pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-[14px] font-bold text-white">
                ₩
              </span>
              <span className="text-[15px] font-bold tracking-tight">머니코스</span>
            </div>
            <span className="chip bg-canvas/70 text-sub backdrop-blur">PWA · Beta</span>
          </div>

          <div className="mt-14 animate-fade-up">
            <span className="eyebrow text-brand">AI BUDGET CONCIERGE</span>
            <h1 className="mt-3 text-[34px] font-extrabold leading-[1.15] tracking-[-0.02em] text-balance">
              예산만 입력하면,
              <br />
              AI가 <span className="text-brand">하루를 설계</span>해요.
            </h1>
            <p className="mt-4 max-w-[19rem] text-[15px] leading-relaxed text-sub text-balance">
              AI가 남은 생활비와 취향을 분석해, 예산 안에서 가장 만족도 높은 경험을
              추천하고 사람들과 함께 공유하는 소셜 플랫폼.
            </p>
          </div>

          {/* Hero mock peek */}
          <div className="relative mt-9 animate-scale-in">
            <HeroCard />
          </div>

          <div className="mt-7 flex flex-col gap-2.5">
            <Link href="/home" className="btn-brand btn-lg w-full">
              지금 시작하기 <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/explore" className="btn-ghost btn-lg w-full">
              코스 먼저 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="mt-12 grid grid-cols-3 gap-2 px-6">
        {[
          ["10초", "코스 설계"],
          ["96%", "예산 적중률*"],
          ["4.9", "평균 만족도"],
        ].map(([a, b]) => (
          <div key={b} className="card px-3 py-4 text-center">
            <div className="text-[22px] font-extrabold tracking-tight text-ink">{a}</div>
            <div className="mt-0.5 text-[11px] text-sub">{b}</div>
          </div>
        ))}
      </section>

      {/* Problem */}
      <section className="mt-14 px-6">
        <span className="eyebrow">THE PROBLEM</span>
        <h2 className="mt-2 text-[22px] font-bold leading-snug tracking-tight text-balance">
          돈이 없는 게 아니라,
          <br />
          <span className="text-sub">잘 쓸 방법</span>을 찾기 어렵다.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-sub">
          네이버·인스타·블로그·유튜브·지도를 오가며 직접 조합해야 하는 지금.
          10·20대는 매번 <b className="text-ink">검색 피로 · 선택 피로 · 비교 피로</b>를 반복해요.
        </p>
        <div className="mt-4 card p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-sub">기존 서비스의 시작점</span>
            <span className="font-semibold text-ink">“어디 갈까?” (장소)</span>
          </div>
          <div className="my-3 h-px bg-hairline" />
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-sub">사용자의 진짜 시작점</span>
            <span className="font-semibold text-brand">“오늘 얼마 쓰지?” (예산)</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-14 px-6">
        <span className="eyebrow">WHY MONEYCOURSE</span>
        <h2 className="mt-2 text-[22px] font-bold tracking-tight">
          단순 추천이 아닌, AI 소비 코치
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card flex items-start gap-3.5 p-4">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${f.tint}`}>
                <f.Icon className="h-[22px] w-[22px]" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-ink">{f.title}</h3>
                <p className="mt-0.5 text-[13px] leading-relaxed text-sub">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative">
            <CloudIcon className="h-7 w-7 text-white/80" />
            <h2 className="mt-4 text-[22px] font-bold leading-snug tracking-tight">
              오늘 예산, 가장 잘 쓰는 법.
              <br />
              머니코스가 설계할게요.
            </h2>
            <Link href="/home" className="btn-brand btn-lg mt-6 w-full">
              무료로 시작하기 <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-sub/70">
          * 데모용 지표(가설·리서치 기반)입니다. 실제 데이터로 검증해 나갑니다.
          <br />
          Money Course™ · 2026 Product Concept
        </p>
      </section>
    </main>
  );
}

function HeroCard() {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand">
          <SparkleIcon className="h-4 w-4" />
        </span>
        <span className="text-[12px] font-semibold text-sub">오늘의 AI 브리핑</span>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">
        “이번 달 예산이 얼마 남지 않아 <span className="text-brand">무료 전시·산책</span> 위주로
        추천드릴게요.”
      </p>
      <div className="mt-4 rounded-2xl bg-muted p-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-sub">이번 주말 추천 예산</span>
          <span className="font-bold text-ink">30,000원</span>
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {[
            ["☕", "감성카페"],
            ["🎁", "팝업"],
            ["🌳", "서울숲"],
          ].map(([e, t]) => (
            <span key={t} className="chip flex-1 justify-center bg-canvas text-ink">
              <span>{e}</span> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

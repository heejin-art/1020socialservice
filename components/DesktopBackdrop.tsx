// Decorative backdrop shown around the app column on larger (desktop) screens.
// On mobile the app is full-bleed, so this is hidden.
export default function DesktopBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
    >
      <div className="absolute inset-0 bg-[#0A0B0D]" />
      <div className="absolute inset-0 mesh-brand opacity-90" />
      <div className="absolute inset-0 grain opacity-[0.5]" />
      <div className="absolute left-10 top-10 select-none">
        <div className="flex items-center gap-2 text-white/70">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-[13px] font-bold">
            ₩
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-white/90">
            머니코스
          </span>
        </div>
        <p className="mt-3 max-w-[220px] text-[12px] leading-relaxed text-white/45">
          PWA · 모바일에서 홈 화면에 추가하면 앱처럼 동작합니다.
        </p>
      </div>
      <div className="absolute bottom-10 right-10 text-right text-[11px] leading-relaxed text-white/35">
        Money Course™ · 2026
        <br />
        AI-designed days within your budget
      </div>
    </div>
  );
}

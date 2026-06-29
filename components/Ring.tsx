interface RingProps {
  value: number; // 0~1
  size?: number;
  stroke?: number;
  className?: string; // applied to progress stroke (text-* color)
  trackClass?: string;
  children?: React.ReactNode;
}

export default function Ring({
  value,
  size = 96,
  stroke = 9,
  className = "text-brand",
  trackClass = "text-hairline",
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const dash = c * clamped;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={className}
          stroke="currentColor"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

// 포맷 유틸

export function won(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

export function wonShort(n: number): string {
  if (n === 0) return "무료";
  if (n >= 10000) {
    const man = n / 10000;
    return (Number.isInteger(man) ? man : man.toFixed(1)) + "만원";
  }
  if (n >= 1000) return n / 1000 + "천원";
  return n.toLocaleString("ko-KR") + "원";
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${m.toString().padStart(2, "0")}`;
}

export function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function pct(n: number): string {
  return Math.round(n * 100) + "%";
}

// 결정론적 의사난수 (시드 기반) — 빌드/SSR 안정성을 위해 Math.random 미사용
export function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

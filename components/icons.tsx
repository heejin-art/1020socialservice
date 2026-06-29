import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  width: 24,
  height: 24,
};

export const HomeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const CompassIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.2 8.8-1.7 4.7-4.7 1.7 1.7-4.7z" />
  </svg>
);

export const BookmarkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 4h12v16l-6-3.6L6 20z" />
  </svg>
);

export const BookmarkFill = (p: P) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M6 4h12v16l-6-3.6L6 20z" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5c.5 3.6 1.4 4.5 5 5-3.6.5-4.5 1.4-5 5-.5-3.6-1.4-4.5-5-5 3.6-.5 4.5-1.4 5-5Z" />
    <path d="M18.5 13.5c.25 1.6.7 2 2.3 2.3-1.6.25-2 .7-2.3 2.3-.25-1.6-.7-2-2.3-2.3 1.6-.25 2-.7 2.3-2.3Z" />
  </svg>
);

export const MapPinIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21c4.5-4.3 7-7.4 7-10.6A7 7 0 0 0 5 10.4C5 13.6 7.5 16.7 12 21Z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const WalletIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.3-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7c0 5-7 9.3-7 9.3Z" />
  </svg>
);

export const HeartFill = (p: P) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M12 20.5s-7.3-4.4-7.3-9.6A4.2 4.2 0 0 1 12 7.8a4.2 4.2 0 0 1 7.3 3.1c0 5.2-7.3 9.6-7.3 9.6Z" />
  </svg>
);

export const ShareIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="12" r="2.2" />
    <circle cx="17.5" cy="6.5" r="2.2" />
    <circle cx="17.5" cy="17.5" r="2.2" />
    <path d="m8 11 7.5-3.7M8 13l7.5 3.7" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16.9 7.4 18.3l.9-5.1L4.5 9.5l5.2-.7z" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14c2.3.3 4 2.3 4 5" />
  </svg>
);

export const SlidersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
);

export const RouteIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="6" r="2.2" />
    <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
  </svg>
);

export const TrendIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 16l5-5 3 3 6-7" />
    <path d="M14 7h4v4" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const RefreshIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v3.5h-3.5" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4v10m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </svg>
);

export const CloudIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.6 3.6 0 0 1 17 18H7Z" />
  </svg>
);

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, CompassIcon, HomeIcon, PlusIcon, UserIcon } from "./icons";

const TABS = [
  { href: "/home", label: "홈", Icon: HomeIcon },
  { href: "/explore", label: "탐색", Icon: CompassIcon },
  { href: "/saved", label: "저장", Icon: BookmarkIcon },
  { href: "/profile", label: "MY", Icon: UserIcon },
];

const HIDDEN = ["/", "/plan", "/result", "/onboarding"];

export default function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN.includes(pathname)) return null;

  const isActive = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  return (
    <nav className="sticky bottom-0 z-40">
      <div className="relative mx-auto max-w-app border-t border-hairline bg-canvas/90 backdrop-blur-xl">
        <div className="grid grid-cols-5 items-end px-2 pb-safe pt-2">
          {TABS.slice(0, 2).map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)} />
          ))}

          {/* center FAB → 코스 설계 */}
          <div className="flex justify-center">
            <Link
              href="/plan"
              aria-label="코스 설계"
              className="btn-brand -mt-7 h-14 w-14 rounded-2xl shadow-glow"
            >
              <PlusIcon className="h-6 w-6" />
            </Link>
          </div>

          {TABS.slice(2).map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function Tab({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => JSX.Element;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition-colors ${
        active ? "text-brand" : "text-sub/70"
      }`}
    >
      <Icon className="h-[22px] w-[22px]" />
      {label}
    </Link>
  );
}

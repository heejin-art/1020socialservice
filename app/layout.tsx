import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import ServiceWorker from "@/components/ServiceWorker";
import DesktopBackdrop from "@/components/DesktopBackdrop";
import BottomNav from "@/components/BottomNav";

const SITE = "머니코스 · Money Course";
const DESC = "AI가 예산 안에서 가장 만족스러운 하루를 설계하는 소셜 플랫폼. 오늘 쓸 예산만 입력하면 끝.";

export const metadata: Metadata = {
  metadataBase: new URL("https://moneycourse.vercel.app"),
  title: {
    default: SITE,
    template: "%s · 머니코스",
  },
  description: DESC,
  applicationName: "머니코스",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "머니코스",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: SITE,
    description: DESC,
    type: "website",
    locale: "ko_KR",
    siteName: "머니코스",
  },
  twitter: { card: "summary_large_image", title: SITE, description: DESC },
  keywords: ["머니코스", "예산", "데이트코스", "AI 추천", "Z세대", "소셜", "가성비"],
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <DesktopBackdrop />
        <StoreProvider>
          {children}
          <BottomNav />
        </StoreProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}

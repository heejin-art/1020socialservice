/**
 * 머니코스 — GitHub Pages(정적 호스팅) 배포를 위해 정적 export를 사용합니다.
 * - GitHub Project Pages 경로: https://<user>.github.io/1020socialservice/
 *   → basePath/assetPrefix 가 필요합니다. CI에서 NEXT_PUBLIC_BASE_PATH 로 주입합니다.
 * - 로컬(dev/build)에서는 NEXT_PUBLIC_BASE_PATH 가 비어 있어 루트(/)에서 동작합니다.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;

import Link from "next/link";
import { CloudIcon } from "@/components/icons";

export const metadata = { title: "오프라인" };

export default function Offline() {
  return (
    <main className="app-shell grid min-h-[100dvh] place-items-center px-8 text-center">
      <div>
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-sub mx-auto">
          <CloudIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-[20px] font-bold">오프라인 상태예요</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-sub">
          네트워크 연결을 확인해주세요.
          <br />
          저장한 코스는 연결되면 다시 볼 수 있어요.
        </p>
        <Link href="/home" className="btn-brand btn-md mt-6">
          다시 시도
        </Link>
      </div>
    </main>
  );
}

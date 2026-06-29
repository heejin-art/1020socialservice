import { SOCIAL_COURSES } from "@/lib/courses";
import CourseDetailClient from "@/components/CourseDetailClient";

// 정적 export: 모든 소셜 코스 상세를 사전 생성
export function generateStaticParams() {
  return SOCIAL_COURSES.map((c) => ({ id: c.id }));
}

export const dynamicParams = false;

export default function Page({ params }: { params: { id: string } }) {
  return <CourseDetailClient id={params.id} />;
}

import { CourseCardProps } from "@/components/course/CourseCard";

export const mockCourses: CourseCardProps[] = [
  {
    id: "1",
    title: "React와 TypeScript로 만드는 실전 웹 애플리케이션",
    instructor: "김개발",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop",
    rating: 4.9,
    reviewCount: 2341,
    duration: "32시간",
    price: 89000,
    originalPrice: 149000,
    badges: ["BEST", "AI PICK"],
  },
  {
    id: "2",
    title: "Python 데이터 분석 마스터 클래스",
    instructor: "이분석",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=340&fit=crop",
    rating: 4.8,
    reviewCount: 1892,
    duration: "28시간",
    price: 79000,
    originalPrice: 129000,
    badges: ["BEST"],
  },
  {
    id: "3",
    title: "AI/ML 입문: ChatGPT 시대의 기초",
    instructor: "박인공",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop",
    rating: 4.7,
    reviewCount: 1245,
    duration: "20시간",
    price: 69000,
    badges: ["NEW", "AI PICK"],
  },
  {
    id: "4",
    title: "Figma 마스터: UI/UX 디자인 실무",
    instructor: "최디자인",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop",
    rating: 4.9,
    reviewCount: 987,
    duration: "24시간",
    price: 99000,
    originalPrice: 159000,
    badges: ["인기"],
  },
  {
    id: "5",
    title: "Next.js 14 완벽 가이드: App Router",
    instructor: "정프론트",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=340&fit=crop",
    rating: 4.8,
    reviewCount: 756,
    duration: "26시간",
    price: 109000,
    originalPrice: 179000,
    badges: ["NEW"],
  },
  {
    id: "6",
    title: "AWS 클라우드 아키텍처 실전",
    instructor: "한클라우드",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop",
    rating: 4.6,
    reviewCount: 543,
    duration: "40시간",
    price: 149000,
    badges: ["BEST"],
  },
];

// Mock lessons for demo purposes (when no DB lessons exist)
export const mockLessons: Record<string, { id: string; title: string; duration: string; is_preview: boolean }[]> = {
  "1": [
    { id: "1-1", title: "강의 소개 및 학습 목표", duration: "5:30", is_preview: true },
    { id: "1-2", title: "개발 환경 설정", duration: "12:45", is_preview: true },
    { id: "1-3", title: "첫 번째 프로젝트 만들기", duration: "18:20", is_preview: false },
    { id: "1-4", title: "컴포넌트 기초", duration: "25:00", is_preview: false },
    { id: "1-5", title: "상태 관리의 이해", duration: "30:15", is_preview: false },
  ],
  "2": [
    { id: "2-1", title: "Python 설치 및 환경 설정", duration: "8:00", is_preview: true },
    { id: "2-2", title: "데이터 분석 기초", duration: "15:30", is_preview: false },
    { id: "2-3", title: "Pandas 활용하기", duration: "22:00", is_preview: false },
  ],
  "3": [
    { id: "3-1", title: "AI 개념 소개", duration: "10:00", is_preview: true },
    { id: "3-2", title: "ChatGPT 활용법", duration: "20:00", is_preview: false },
  ],
};

export const myCourses: (CourseCardProps & { progress: number })[] = [
  {
    ...mockCourses[0],
    progress: 67,
  },
  {
    ...mockCourses[2],
    progress: 23,
  },
  {
    ...mockCourses[4],
    progress: 45,
  },
];

export const categories = [
  { id: "all", name: "전체", icon: "🎯" },
  { id: "dev", name: "개발 · 프로그래밍", icon: "💻" },
  { id: "data", name: "데이터 사이언스", icon: "📊" },
  { id: "ai", name: "AI · 머신러닝", icon: "🤖" },
  { id: "design", name: "디자인", icon: "🎨" },
  { id: "business", name: "비즈니스", icon: "💼" },
  { id: "marketing", name: "마케팅", icon: "📈" },
];

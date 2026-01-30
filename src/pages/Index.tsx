import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CourseCarousel } from "@/components/course/CourseCarousel";
import { CategoryTabs } from "@/components/course/CategoryTabs";
import { AITutorButton } from "@/components/ai/AITutorButton";
import { mockCourses, categories } from "@/data/mockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroBanner />

      {/* Category Filter */}
      <section className="container py-8">
        <CategoryTabs categories={categories} />
      </section>

      {/* Course Carousels */}
      <CourseCarousel
        title="🔥 실시간 BEST 강의"
        subtitle="지금 가장 인기 있는 강의를 만나보세요"
        courses={mockCourses}
      />

      <CourseCarousel
        title="✨ AI 추천 강의"
        subtitle="당신의 학습 성향에 맞춘 맞춤 추천"
        courses={[...mockCourses].reverse()}
      />

      <CourseCarousel
        title="🚀 신규 강의"
        subtitle="새롭게 출시된 따끈따끈한 강의"
        courses={mockCourses.filter((c) => c.badges?.includes("NEW"))}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-vibe flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <span className="font-bold text-xl">
                  Edu<span className="gradient-vibe-text">Vibe</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                학습의 흐름을 끊지 않는<br />차세대 LMS 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">강의 둘러보기</li>
                <li className="hover:text-primary cursor-pointer">로드맵</li>
                <li className="hover:text-primary cursor-pointer">커뮤니티</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">자주 묻는 질문</li>
                <li className="hover:text-primary cursor-pointer">1:1 문의</li>
                <li className="hover:text-primary cursor-pointer">이용약관</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">회사 소개</li>
                <li className="hover:text-primary cursor-pointer">채용</li>
                <li className="hover:text-primary cursor-pointer">블로그</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 EduVibe. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AI Tutor Floating Button */}
      <AITutorButton />
    </div>
  );
};

export default Index;

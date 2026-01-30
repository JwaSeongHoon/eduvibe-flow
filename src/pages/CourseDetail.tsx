import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { AITutorButton } from "@/components/ai/AITutorButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  Clock,
  Users,
  Play,
  FileText,
  Download,
  CheckCircle,
  Lock,
  ChevronLeft,
  BookOpen,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { mockCourses } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useLessons } from "@/hooks/useLessons";

const curriculum = [
  {
    title: "섹션 1: 시작하기",
    lessons: [
      { id: "1-1", title: "강의 소개 및 학습 목표", duration: "5:30", free: true },
      { id: "1-2", title: "개발 환경 설정", duration: "12:45", free: true },
      { id: "1-3", title: "첫 번째 프로젝트 만들기", duration: "18:20", free: false },
    ],
  },
  {
    title: "섹션 2: 핵심 개념",
    lessons: [
      { id: "2-1", title: "컴포넌트 기초", duration: "25:00", free: false },
      { id: "2-2", title: "상태 관리의 이해", duration: "30:15", free: false },
      { id: "2-3", title: "이벤트 핸들링", duration: "22:40", free: false },
    ],
  },
  {
    title: "섹션 3: 고급 기법",
    lessons: [
      { id: "3-1", title: "커스텀 훅 만들기", duration: "28:30", free: false },
      { id: "3-2", title: "성능 최적화", duration: "35:00", free: false },
      { id: "3-3", title: "테스트 작성", duration: "40:20", free: false },
    ],
  },
];

const reviews = [
  {
    id: "1",
    user: "김학생",
    rating: 5,
    date: "2024-01-15",
    content: "정말 알차고 실무에 바로 적용할 수 있는 강의입니다. 강사님 설명이 너무 좋아요!",
  },
  {
    id: "2",
    user: "이개발",
    rating: 5,
    date: "2024-01-12",
    content: "기초부터 고급까지 체계적으로 배울 수 있어서 좋았습니다.",
  },
  {
    id: "3",
    user: "박코딩",
    rating: 4,
    date: "2024-01-10",
    content: "내용은 좋은데 조금 더 실습 예제가 많았으면 좋겠어요.",
  },
];

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isEnrolled, loading: enrollmentLoading } = useEnrollment(courseId);
  const { lessons, loading: lessonsLoading } = useLessons(courseId);
  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
  const [activeTab, setActiveTab] = useState<"curriculum" | "reviews">("curriculum");

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handleEnrollClick = () => {
    // 로그인이 안됨 -> 결제 페이지 이동 (로그인 페이지 거쳐서)
    if (!user) {
      navigate(`/auth?redirect=/checkout/${course.id}`);
      return;
    }
    // 로그인이 됨 && 본인 수강 강의가 아님 -> 결제 페이지 이동
    if (!isEnrolled) {
      navigate(`/checkout/${course.id}`);
    }
  };

  const handleStartLearning = () => {
    // 등록된 레슨이 있으면 첫 번째 레슨으로 이동
    if (lessons.length > 0) {
      navigate(`/learn/${course.id}/${lessons[0].id}`);
    } else {
      // 레슨이 없으면 기본 경로로 이동
      navigate(`/learn/${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-8 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container">
          <Link to="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ChevronLeft className="w-4 h-4" />
            강의 목록
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-2 mb-4">
                  {course.badges?.map((badge) => (
                    <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary">
                      {badge}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {course.title}
                </h1>

                <p className="text-lg text-muted-foreground mb-6">
                  실무에서 바로 활용 가능한 핵심 스킬을 마스터하세요. 
                  초보자도 따라할 수 있는 친절한 설명과 다양한 실습 예제를 제공합니다.
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="font-semibold text-foreground">{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviewCount}개 수강평)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{(course.reviewCount * 3).toLocaleString()}명 수강중</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </motion.div>

              {/* Preview Video */}
              <motion.div
                className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full gradient-vibe flex items-center justify-center glow-primary hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  미리보기 강의
                </div>
              </motion.div>

              {/* Instructor */}
              <motion.div
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <div>
                  <p className="font-semibold text-foreground">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground">10년차 시니어 개발자 | 전 네이버, 카카오</p>
                </div>
              </motion.div>
            </div>

            {/* Right: Purchase Card */}
            <div className="lg:col-span-1">
              <motion.div
                className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    {discount > 0 && (
                      <span className="text-2xl font-bold text-accent">{discount}%</span>
                    )}
                    <span className="text-3xl font-bold text-foreground">
                      ₩{course.price.toLocaleString()}
                    </span>
                  </div>
                  {course.originalPrice && (
                    <p className="text-muted-foreground line-through">
                      ₩{course.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {authLoading || enrollmentLoading ? (
                    <Button 
                      className="w-full gradient-vibe text-primary-foreground glow-primary text-lg h-12"
                      disabled
                    >
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      로딩 중...
                    </Button>
                  ) : isEnrolled ? (
                    <Button 
                      className="w-full gradient-vibe text-primary-foreground glow-primary text-lg h-12"
                      onClick={handleStartLearning}
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      학습하기
                    </Button>
                  ) : (
                    <Button 
                      className="w-full gradient-vibe text-primary-foreground glow-primary text-lg h-12"
                      onClick={handleEnrollClick}
                    >
                      수강 신청하기
                    </Button>
                  )}
                  {!isEnrolled && (
                    <Button variant="outline" className="w-full border-border h-12">
                      위시리스트에 추가
                    </Button>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>총 {course.duration} 분량</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>강의 자료 제공</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    <span>평생 소장</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>수료증 발급</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Reviews */}
      <section className="container py-8">
        <div className="lg:max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === "curriculum"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("curriculum")}
            >
              커리큘럼
            </button>
            <button
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              수강평 ({reviews.length})
            </button>
          </div>

          {/* Curriculum */}
          {activeTab === "curriculum" && (
            <div className="space-y-3">
              {lessonsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">레슨 로딩 중...</span>
                </div>
              ) : lessons.length > 0 ? (
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border">
                    <span className="font-semibold">전체 레슨 ({lessons.length}개)</span>
                  </div>
                  <div className="divide-y divide-border">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (isEnrolled || lesson.is_preview) {
                            navigate(`/learn/${courseId}/${lesson.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                          <Play className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{lesson.title}</span>
                          {lesson.is_preview && (
                            <Badge variant="outline" className="text-primary border-primary text-xs">
                              미리보기
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {lesson.duration && <span>{lesson.duration}</span>}
                          {!isEnrolled && !lesson.is_preview && <Lock className="w-4 h-4" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">아직 등록된 레슨이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{review.user}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-warning fill-warning"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AITutorButton />
    </div>
  );
}

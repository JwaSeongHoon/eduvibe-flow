import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  FileText,
  Download,
  BookOpen,
  Sparkles,
  Bookmark,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { mockCourses } from "@/data/mockData";

const curriculum = [
  {
    title: "섹션 1: 시작하기",
    lessons: [
      { id: "1-1", title: "강의 소개 및 학습 목표", duration: "5:30", completed: true },
      { id: "1-2", title: "개발 환경 설정", duration: "12:45", completed: true },
      { id: "1-3", title: "첫 번째 프로젝트 만들기", duration: "18:20", completed: false },
    ],
  },
  {
    title: "섹션 2: 핵심 개념",
    lessons: [
      { id: "2-1", title: "컴포넌트 기초", duration: "25:00", completed: false },
      { id: "2-2", title: "상태 관리의 이해", duration: "30:15", completed: false },
      { id: "2-3", title: "이벤트 핸들링", duration: "22:40", completed: false },
    ],
  },
  {
    title: "섹션 3: 고급 기법",
    lessons: [
      { id: "3-1", title: "커스텀 훅 만들기", duration: "28:30", completed: false },
      { id: "3-2", title: "성능 최적화", duration: "35:00", completed: false },
      { id: "3-3", title: "테스트 작성", duration: "40:20", completed: false },
    ],
  },
];

const materials = [
  { name: "강의자료.pdf", size: "2.4 MB" },
  { name: "소스코드.zip", size: "15.2 MB" },
  { name: "참고자료.pdf", size: "1.1 MB" },
];

export default function LearningPlayer() {
  const { courseId, lessonId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(35);

  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
  
  const allLessons = curriculum.flatMap((section) => section.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];
  const prevLesson = allLessons[currentLessonIndex - 1];
  const nextLesson = allLessons[currentLessonIndex + 1];

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.completed).length;
  const courseProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${courseId}`} className="text-muted-foreground hover:text-primary">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-sm text-muted-foreground line-clamp-1">{course.title}</p>
            <p className="text-sm font-medium text-foreground line-clamp-1">{currentLesson.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Progress value={courseProgress} className="w-32 h-2" />
            <span className="text-sm text-muted-foreground">{courseProgress}%</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Player */}
          <div className="relative bg-black aspect-video shrink-0">
            <img
              src={course.thumbnail}
              alt={currentLesson.title}
              className="w-full h-full object-cover opacity-50"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-primary" />
                ) : (
                  <Play className="w-8 h-8 text-primary ml-1" />
                )}
              </button>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1 bg-muted rounded-full cursor-pointer group">
                  <div
                    className="h-full gradient-vibe rounded-full relative transition-all"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-foreground" />
                    ) : (
                      <Play className="w-5 h-5 text-foreground" />
                    )}
                  </button>
                  <button>
                    <SkipBack className="w-5 h-5 text-foreground" />
                  </button>
                  <button>
                    <SkipForward className="w-5 h-5 text-foreground" />
                  </button>
                  <button>
                    <Volume2 className="w-5 h-5 text-foreground" />
                  </button>
                  <span className="text-sm text-foreground ml-2">
                    2:15 / {currentLesson.duration}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button>
                    <Bookmark className="w-5 h-5 text-foreground" />
                  </button>
                  <button>
                    <Settings className="w-5 h-5 text-foreground" />
                  </button>
                  <button>
                    <Maximize className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex-1 overflow-hidden bg-card border-t border-border">
            <Tabs defaultValue="notes" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-12 px-4">
                <TabsTrigger value="notes" className="data-[state=active]:bg-secondary gap-2">
                  <BookOpen className="w-4 h-4" />
                  강의 노트
                </TabsTrigger>
                <TabsTrigger value="materials" className="data-[state=active]:bg-secondary gap-2">
                  <Download className="w-4 h-4" />
                  학습 자료
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-secondary gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI 도우미
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="flex-1 p-4 m-0 overflow-auto">
                <Textarea
                  placeholder="강의를 들으며 메모를 작성하세요..."
                  className="min-h-[200px] bg-secondary border-border resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">북마크 타임라인</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">1:23</span>
                      <span className="text-sm text-muted-foreground">중요 개념 설명</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="flex-1 p-4 m-0 overflow-auto">
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{material.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{material.size}</span>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="flex-1 p-4 m-0 overflow-auto">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">AI 학습 도우미</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      현재 강의와 관련된 질문을 해보세요. 개념 설명, 요약, 퀴즈 생성 등을 도와드립니다.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="border-border">
                      이 강의 요약해줘
                    </Button>
                    <Button variant="outline" size="sm" className="border-border">
                      퀴즈 만들어줘
                    </Button>
                    <Button variant="outline" size="sm" className="border-border">
                      쉽게 설명해줘
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Navigation */}
          <div className="h-14 bg-card border-t border-border flex items-center justify-between px-4 shrink-0">
            {prevLesson ? (
              <Link to={`/learn/${courseId}/${prevLesson.id}`}>
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  <ChevronLeft className="w-4 h-4" />
                  이전 강의
                </Button>
              </Link>
            ) : (
              <div />
            )}
            <Button className="gradient-vibe text-primary-foreground">
              완료하고 다음 강의
            </Button>
            {nextLesson ? (
              <Link to={`/learn/${courseId}/${nextLesson.id}`}>
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  다음 강의
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card overflow-hidden shrink-0"
            >
              <div className="w-80 h-full overflow-y-auto scrollbar-custom">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">커리큘럼</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedLessons}/{totalLessons} 완료
                  </p>
                </div>

                <div className="p-2">
                  {curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-4">
                      <p className="px-3 py-2 text-sm font-medium text-muted-foreground">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {section.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            to={`/learn/${courseId}/${lesson.id}`}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                lesson.id === lessonId
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-secondary text-foreground"
                              )}
                            >
                              {lesson.completed ? (
                                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourses";
import { useLessons, Lesson, getSignedVideoUrl } from "@/hooks/useLessons";
import { Card, CardContent } from "@/components/ui/card";

const materials = [
  { name: "강의자료.pdf", size: "2.4 MB" },
  { name: "소스코드.zip", size: "15.2 MB" },
  { name: "참고자료.pdf", size: "1.1 MB" },
];

export default function LearningPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isEnrolled, loading: enrollmentLoading } = useEnrollment(courseId);
  const { course, loading: courseLoading } = useCourse(courseId);
  const { lessons, loading: lessonsLoading } = useLessons(courseId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Find current lesson - if no lessonId provided, use first lesson
  const currentLessonIndex = lessonId 
    ? lessons.findIndex((l) => l.id === lessonId)
    : 0;
  const currentLesson = lessons[currentLessonIndex] || lessons[0];
  const prevLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];

  const totalLessons = lessons.length;
  const completedCount = completedLessons.size;
  const courseProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Load video URL when lesson changes
  useEffect(() => {
    async function loadVideo() {
      if (!currentLesson?.video_url || !isEnrolled) return;

      setVideoLoading(true);
      try {
        const signedUrl = await getSignedVideoUrl(currentLesson.video_url);
        setVideoUrl(signedUrl);
      } catch (error) {
        console.error("영상 로딩 실패:", error);
        setVideoUrl(null);
      } finally {
        setVideoLoading(false);
      }
    }

    loadVideo();
  }, [currentLesson, isEnrolled]);

  // Handle video playback
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (currentLesson) {
      setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
    }
  };

  // Loading state
  const isLoading = authLoading || enrollmentLoading || courseLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-6">
              강의를 시청하려면 먼저 로그인해주세요.
            </p>
            <Button onClick={() => navigate(`/auth?redirect=/learn/${courseId}/${lessonId}`)}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not enrolled - access denied
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">결제가 필요한 강의입니다</h2>
            <p className="text-muted-foreground mb-6">
              이 강의를 시청하려면 수강 신청이 필요합니다.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
                강의 소개
              </Button>
              <Button onClick={() => navigate(`/checkout/${courseId}`)}>
                수강 신청하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${courseId}`} className="text-muted-foreground hover:text-primary">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-sm text-muted-foreground line-clamp-1">{course?.title}</p>
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {currentLesson?.title || "레슨 없음"}
            </p>
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
            {videoLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <>
                <img
                  src={course?.thumbnail_url || "/placeholder.svg"}
                  alt={currentLesson?.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>영상을 불러올 수 없습니다</p>
                  </div>
                </div>
              </>
            )}
            
            {/* Play button overlay */}
            {videoUrl && !videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary" />
                  ) : (
                    <Play className="w-8 h-8 text-primary ml-1" />
                  )}
                </button>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1 bg-muted rounded-full cursor-pointer group">
                  <div
                    className="h-full bg-primary rounded-full relative transition-all"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay}>
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
                    {currentLesson?.duration || "0:00"}
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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              <div className="w-80 h-full overflow-y-auto">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">커리큘럼</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedCount}/{totalLessons} 완료
                  </p>
                </div>

                <div className="p-2">
                  {lessons.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      등록된 레슨이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {lessons.map((lesson, index) => (
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
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">
                                {index + 1}. {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration || "0:00"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

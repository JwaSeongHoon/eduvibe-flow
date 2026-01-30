import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MessageSquare, ThumbsUp, CheckCircle2, Clock, PenSquare, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface Question {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  answers: number;
  isResolved: boolean;
  tags: string[];
}

const mockQuestions: Question[] = [
  {
    id: "1",
    courseId: "1",
    courseName: "React와 TypeScript로 만드는 실전 웹 애플리케이션",
    title: "useEffect 의존성 배열 관련 질문입니다",
    content: "useEffect에서 의존성 배열에 함수를 넣으면 무한 루프가 발생하는데, useCallback을 사용해야 하나요?",
    author: "김학습",
    authorAvatar: "K",
    createdAt: "2시간 전",
    likes: 12,
    answers: 3,
    isResolved: true,
    tags: ["React", "Hooks", "useEffect"],
  },
  {
    id: "2",
    courseId: "2",
    courseName: "Python 데이터 분석 마스터 클래스",
    title: "Pandas DataFrame 병합 시 메모리 문제",
    content: "대용량 CSV 파일 두 개를 merge 하려고 하는데 메모리 에러가 발생합니다. 청크 단위로 처리하는 방법이 있을까요?",
    author: "이데이터",
    authorAvatar: "L",
    createdAt: "5시간 전",
    likes: 8,
    answers: 2,
    isResolved: false,
    tags: ["Python", "Pandas", "데이터처리"],
  },
  {
    id: "3",
    courseId: "3",
    courseName: "AI/ML 입문: ChatGPT 시대의 기초",
    title: "GPT API 토큰 계산 방법 문의",
    content: "OpenAI API를 사용할 때 토큰 수를 미리 계산하고 싶은데, tiktoken 라이브러리 사용법을 알려주세요.",
    author: "박인공",
    authorAvatar: "P",
    createdAt: "1일 전",
    likes: 24,
    answers: 5,
    isResolved: true,
    tags: ["AI", "OpenAI", "API"],
  },
  {
    id: "4",
    courseId: "1",
    courseName: "React와 TypeScript로 만드는 실전 웹 애플리케이션",
    title: "TypeScript에서 제네릭 타입 추론이 안 됩니다",
    content: "커스텀 훅에서 제네릭을 사용하는데, 타입이 자동 추론되지 않고 unknown으로 나옵니다.",
    author: "정타입",
    authorAvatar: "J",
    createdAt: "2일 전",
    likes: 15,
    answers: 4,
    isResolved: false,
    tags: ["TypeScript", "제네릭", "타입추론"],
  },
  {
    id: "5",
    courseId: "4",
    courseName: "Figma 마스터: UI/UX 디자인 실무",
    title: "Auto Layout 중첩 시 정렬 문제",
    content: "Auto Layout을 중첩해서 사용할 때 자식 요소의 정렬이 예상대로 작동하지 않습니다.",
    author: "최디자인",
    authorAvatar: "C",
    createdAt: "3일 전",
    likes: 6,
    answers: 1,
    isResolved: true,
    tags: ["Figma", "AutoLayout", "UI"],
  },
];

const courses = [
  { id: "all", name: "전체 강의" },
  { id: "1", name: "React와 TypeScript로 만드는 실전 웹 애플리케이션" },
  { id: "2", name: "Python 데이터 분석 마스터 클래스" },
  { id: "3", name: "AI/ML 입문: ChatGPT 시대의 기초" },
  { id: "4", name: "Figma 마스터: UI/UX 디자인 실무" },
];

function QuestionCard({ question }: { question: Question }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(question.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {question.isResolved && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    해결됨
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {question.courseName}
                </span>
              </div>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                {question.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {question.content}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {question.authorAvatar}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{question.author}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{question.createdAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
                <span>{likeCount}</span>
              </button>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{question.answers}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NewQuestionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-vibe text-primary-foreground">
          <PenSquare className="w-4 h-4 mr-2" />
          질문하기
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">새 질문 작성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              강의 선택
            </label>
            <Select>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="질문할 강의를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {courses.slice(1).map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              제목
            </label>
            <Input
              placeholder="질문 제목을 입력하세요"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              내용
            </label>
            <Textarea
              placeholder="질문 내용을 자세히 작성해주세요. 코드나 에러 메시지가 있다면 함께 첨부해주세요."
              className="bg-secondary border-border min-h-[200px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              태그 (쉼표로 구분)
            </label>
            <Input
              placeholder="예: React, Hooks, 상태관리"
              className="bg-secondary border-border"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button className="gradient-vibe text-primary-foreground">
              질문 등록
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === "all" || q.courseId === selectedCourse;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "resolved" && q.isResolved) ||
      (activeTab === "unresolved" && !q.isResolved);
    return matchesSearch && matchesCourse && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pt-24 pb-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">커뮤니티</h1>
            <p className="text-muted-foreground">
              강의 관련 질문을 하고, 다른 학습자들과 지식을 나눠보세요
            </p>
          </div>
          <NewQuestionDialog />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="질문 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[300px] bg-secondary border-border">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="강의 필터" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="unresolved">미해결</TabsTrigger>
            <TabsTrigger value="resolved">해결됨</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                질문이 없습니다
              </h3>
              <p className="text-muted-foreground">
                첫 번째 질문을 작성해보세요!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

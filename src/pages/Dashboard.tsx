import { Header } from "@/components/layout/Header";
import { AITutorButton } from "@/components/ai/AITutorButton";
import { CourseCard } from "@/components/course/CourseCard";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Flame,
  Trophy,
  TrendingUp,
  Play,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";
import { myCourses } from "@/data/mockData";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const weeklyStats = [
  { day: "월", hours: 2 },
  { day: "화", hours: 1.5 },
  { day: "수", hours: 3 },
  { day: "목", hours: 0.5 },
  { day: "금", hours: 2 },
  { day: "토", hours: 4 },
  { day: "일", hours: 1 },
];

const achievements = [
  { icon: "🔥", title: "7일 연속 학습", description: "일주일 연속 학습 완료!" },
  { icon: "📚", title: "첫 강의 완료", description: "첫 번째 강의를 완료했습니다" },
  { icon: "⭐", title: "리뷰 작성자", description: "수강평을 작성했습니다" },
];

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user, loading } = useAuth();
  const maxHours = Math.max(...weeklyStats.map((d) => d.hours));

  const totalHours = weeklyStats.reduce((sum, d) => sum + d.hours, 0);
  const streak = 7;
  const completedCourses = 3;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container pt-24 pb-12 flex items-center justify-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </main>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              로그인이 필요합니다
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              내 학습실을 이용하려면 로그인해주세요. 학습 진도, 통계, 달성 배지를 확인할 수 있습니다.
            </p>
            <Link to="/auth">
              <Button className="gradient-vibe text-primary-foreground">
                <LogIn className="w-4 h-4 mr-2" />
                로그인하기
              </Button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요! 👋
          </h1>
          <p className="text-muted-foreground mb-8">
            오늘도 학습의 흐름을 이어가세요
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Clock, label: "이번 주 학습", value: `${totalHours}시간`, color: "text-primary" },
            { icon: Flame, label: "연속 학습", value: `${streak}일`, color: "text-accent" },
            { icon: BookOpen, label: "수강 중", value: `${myCourses.length}개`, color: "text-info" },
            { icon: Trophy, label: "완료 강의", value: `${completedCourses}개`, color: "text-success" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  📖 이어서 학습하기
                </h2>
              </div>

              {myCourses.length > 0 && (
                <Link to={`/learn/${myCourses[0].id}/1-1`}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-64 aspect-video md:aspect-auto shrink-0">
                          <img
                            src={myCourses[0].thumbnail}
                            alt={myCourses[0].title}
                            className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                          />
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full gradient-vibe flex items-center justify-center">
                              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-foreground mb-2">
                            {myCourses[0].title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {myCourses[0].instructor}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">진도율</span>
                              <span className="text-primary font-medium">
                                {myCourses[0].progress}%
                              </span>
                            </div>
                            <Progress value={myCourses[0].progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.section>

            {/* My Courses */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  📚 수강 중인 강의
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {myCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            </motion.section>

            {/* Weekly Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    주간 학습 통계
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {weeklyStats.map((stat) => (
                      <div
                        key={stat.day}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-md gradient-vibe transition-all duration-300"
                          style={{
                            height: `${(stat.hours / maxHours) * 100}%`,
                            minHeight: stat.hours > 0 ? "8px" : "0",
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {stat.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">📅 학습 캘린더</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">🏆 달성 배지</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <AITutorButton />
    </div>
  );
}

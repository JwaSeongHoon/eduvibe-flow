import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, ShoppingCart, Loader2 } from "lucide-react";
import { mockCourses } from "@/data/mockData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  // Fetch total users
  const { data: usersCount = 0, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch enrollments for stats
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("status", "completed");
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyRevenue = enrollments
    .filter((e) => new Date(e.created_at) >= startOfMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const newEnrollmentsThisMonth = enrollments.filter(
    (e) => new Date(e.created_at) >= startOfMonth
  ).length;

  // Generate last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = last7Days.map((date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayRevenue = enrollments
      .filter((e) => {
        const enrollDate = new Date(e.created_at);
        return enrollDate >= dayStart && enrollDate <= dayEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      revenue: dayRevenue,
    };
  });

  const chartConfig = {
    revenue: {
      label: "매출",
      color: "hsl(var(--primary))",
    },
  };

  const isLoading = loadingUsers || loadingEnrollments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "총 사용자 수",
      value: usersCount.toLocaleString(),
      icon: Users,
      description: "가입 회원",
    },
    {
      title: "이번 달 매출",
      value: `₩${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "완료된 결제 기준",
    },
    {
      title: "활성 강좌 수",
      value: mockCourses.length.toString(),
      icon: BookOpen,
      description: "등록된 강좌",
    },
    {
      title: "이번 달 수강신청",
      value: newEnrollmentsThisMonth.toString(),
      icon: ShoppingCart,
      description: "신규 등록",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>최근 7일 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `₩${Number(value).toLocaleString()}`}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

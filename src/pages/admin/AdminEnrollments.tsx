import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { mockCourses } from "@/data/mockData";
import { format } from "date-fns";

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_key: string;
  order_id: string;
  created_at: string;
  approved_at: string | null;
}

interface Profile {
  user_id: string;
  display_name: string | null;
}

export default function AdminEnrollments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["admin-all-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Enrollment[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const getProfileByUserId = (userId: string) => {
    return profiles.find((p) => p.user_id === userId);
  };

  const getCourseById = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge className="bg-primary hover:bg-primary/90">SUCCESS</Badge>;
      case "pending":
        return <Badge variant="secondary">PENDING</Badge>;
      case "fail":
      case "failed":
        return <Badge variant="destructive">FAIL</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const profile = getProfileByUserId(enrollment.user_id);
    const course = getCourseById(enrollment.course_id);
    
    const matchesSearch =
      profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.order_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      enrollment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmount = filteredEnrollments
    .filter((e) => e.status.toLowerCase() === "completed")
    .reduce((sum, e) => sum + e.amount, 0);

  if (loadingEnrollments) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 결제 건수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEnrollments.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              성공 결제 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              성공률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEnrollments.length > 0
                ? Math.round(
                    (filteredEnrollments.filter(
                      (e) => e.status.toLowerCase() === "completed"
                    ).length /
                      filteredEnrollments.length) *
                      100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="주문번호, 회원명, 강좌명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="completed">SUCCESS</SelectItem>
            <SelectItem value="pending">PENDING</SelectItem>
            <SelectItem value="fail">FAIL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead className="hidden md:table-cell">회원</TableHead>
                <TableHead className="hidden lg:table-cell">강좌</TableHead>
                <TableHead>금액</TableHead>
                <TableHead className="hidden sm:table-cell">결제수단</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="hidden md:table-cell">일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    결제 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment) => {
                  const profile = getProfileByUserId(enrollment.user_id);
                  const course = getCourseById(enrollment.course_id);

                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {enrollment.order_id.slice(0, 12)}...
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                            {profile?.display_name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="text-sm">
                            {profile?.display_name || "알 수 없음"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm line-clamp-1">
                          {course?.title || `ID: ${enrollment.course_id}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₩{enrollment.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {enrollment.payment_method || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(enrollment.created_at), "MM.dd HH:mm")}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

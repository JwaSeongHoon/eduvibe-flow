import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Loader2 } from "lucide-react";
import { mockCourses } from "@/data/mockData";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For now, all users are "active" since we don't have status field
    const matchesStatus = statusFilter === "all" || statusFilter === "active";
    
    return matchesSearch && matchesStatus;
  });

  const handleViewUser = async (profile: Profile) => {
    setSelectedUser(profile);
    setLoadingEnrollments(true);
    
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", profile.user_id);
      
      if (error) throw error;
      setUserEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setUserEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const getCourseById = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름 또는 사용자 ID로 검색..."
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
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="suspended">정지</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>회원 목록 ({filteredProfiles.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead className="hidden md:table-cell">가입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {profile.display_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {profile.display_name || "이름 없음"}
                          </div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {profile.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(profile.created_at), "yyyy.MM.dd")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">활성</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(profile)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {selectedUser.display_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedUser.display_name || "이름 없음"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedUser.user_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    가입일: {format(new Date(selectedUser.created_at), "yyyy년 MM월 dd일")}
                  </p>
                  {selectedUser.bio && (
                    <p className="text-sm mt-2">{selectedUser.bio}</p>
                  )}
                </div>
              </div>

              {/* Enrollments */}
              <div>
                <h4 className="font-semibold mb-3">수강 중인 강좌</h4>
                {loadingEnrollments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : userEnrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    수강 중인 강좌가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userEnrollments.map((enrollment) => {
                      const course = getCourseById(enrollment.course_id);
                      return (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {course?.title || `강좌 ID: ${enrollment.course_id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(enrollment.created_at), "yyyy.MM.dd")} 등록
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ₩{enrollment.amount.toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                enrollment.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {enrollment.status === "completed" ? "완료" : enrollment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { mockCourses } from "@/data/mockData";
import { CourseCardProps } from "@/components/course/CourseCard";

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_key: string;
  order_id: string;
  amount: number;
  payment_method: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrolledCourse extends CourseCardProps {
  progress: number;
  enrolledAt: string;
}

export function useMyEnrollments() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) {
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("수강 목록 조회 실패:", error);
          setEnrolledCourses([]);
        } else if (data) {
          // enrollments 데이터를 course 정보와 매핑
          const courses: EnrolledCourse[] = (data as Enrollment[])
            .map((enrollment) => {
              const courseData = mockCourses.find(
                (c) => c.id === enrollment.course_id
              );
              if (!courseData) return null;
              
              return {
                ...courseData,
                progress: 0, // 실제 진도율은 별도 테이블에서 관리 필요
                enrolledAt: enrollment.created_at,
              };
            })
            .filter((c): c is EnrolledCourse => c !== null);
          
          setEnrolledCourses(courses);
        }
      } catch (error) {
        console.error("수강 목록 조회 오류:", error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [user]);

  return { enrolledCourses, loading };
}

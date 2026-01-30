import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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

interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  category: string;
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
        // 1. 사용자의 수강 내역 조회
        const { data: enrollments, error: enrollError } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (enrollError) {
          console.error("수강 목록 조회 실패:", enrollError);
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        // 2. 수강 중인 강좌 ID 목록 추출
        const courseIds = enrollments.map((e) => e.course_id);

        // 3. 해당 강좌 정보를 DB에서 조회
        const { data: courses, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);

        if (courseError) {
          console.error("강좌 정보 조회 실패:", courseError);
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        // 4. enrollments와 courses를 매핑하여 EnrolledCourse 생성
        const enrolledCourseList: EnrolledCourse[] = (enrollments as Enrollment[])
          .map((enrollment) => {
            const courseData = (courses as Course[]).find(
              (c) => c.id === enrollment.course_id
            );
            if (!courseData) return null;

            const enrolledCourse: EnrolledCourse = {
              id: courseData.id,
              title: courseData.title,
              instructor: courseData.instructor,
              thumbnail: courseData.thumbnail_url || "/placeholder.svg",
              rating: 4.9, // 추후 리뷰 테이블에서 계산
              reviewCount: 0,
              duration: courseData.duration || "",
              price: courseData.price,
              originalPrice: courseData.original_price || undefined,
              badges: [],
              progress: 0, // 실제 진도율은 별도 테이블에서 관리 필요
              enrolledAt: enrollment.created_at,
            };
            return enrolledCourse;
          })
          .filter((c): c is EnrolledCourse => c !== null);

        setEnrolledCourses(enrolledCourseList);
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

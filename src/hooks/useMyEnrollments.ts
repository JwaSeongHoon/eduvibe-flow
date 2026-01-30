import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { mockCourses } from "@/data/mockData";
import { CourseCardProps } from "@/components/course/CourseCard";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type DbCourseLite = {
  id: string;
  title: string;
  instructor: string;
  thumbnail_url: string | null;
  duration: string | null;
  price: number;
  original_price: number | null;
  is_published: boolean;
};

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
          const enrollments = data as Enrollment[];

          // 1) DB courses 먼저 한번에 가져오기 (UUID만)
          const enrollmentCourseIds = enrollments
            .map((e) => e.course_id)
            .filter((id): id is string => Boolean(id));

          const uuidCourseIds = Array.from(new Set(enrollmentCourseIds.filter(isUuid)));
          const dbCoursesById = new Map<string, DbCourseLite>();

          if (uuidCourseIds.length > 0) {
            const { data: dbCourses, error: coursesError } = await supabase
              .from("courses")
              .select("id,title,instructor,thumbnail_url,duration,price,original_price,is_published")
              .in("id", uuidCourseIds);

            if (coursesError) {
              console.error("수강 강좌 정보 조회 실패:", coursesError);
            } else {
              (dbCourses || []).forEach((c) => dbCoursesById.set(c.id, c));
            }
          }

          const toCourseCardProps = (c: (typeof mockCourses)[number] | null, db?: DbCourseLite | null): CourseCardProps | null => {
            if (c) return c;
            if (!db) return null;
            return {
              id: db.id,
              title: db.title,
              instructor: db.instructor,
              thumbnail: db.thumbnail_url || "/placeholder.svg",
              rating: 4.8,
              reviewCount: 0,
              duration: db.duration || "",
              price: db.price,
              originalPrice: db.original_price || undefined,
              badges: db.is_published ? ["DB"] : ["DB", "미공개"],
            };
          };

          // 2) enrollment 순서 유지하면서 매핑 (DB 우선, 없으면 mock)
          const courses: EnrolledCourse[] = enrollments
            .map((enrollment) => {
              const dbCourse = dbCoursesById.get(enrollment.course_id) || null;
              const mockCourse = mockCourses.find((m) => m.id === enrollment.course_id) || null;
              const base = toCourseCardProps(mockCourse, dbCourse);
              if (!base) return null;

              return {
                ...base,
                progress: 0,
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

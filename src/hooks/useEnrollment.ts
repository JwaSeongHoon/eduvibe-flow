import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

export function useEnrollment(courseId: string | undefined) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEnrollment() {
      if (!user || !courseId) {
        setIsEnrolled(false);
        setEnrollment(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .eq("status", "completed")
          .maybeSingle();

        if (error) {
          console.error("수강 정보 조회 실패:", error);
          setIsEnrolled(false);
          setEnrollment(null);
        } else if (data) {
          setIsEnrolled(true);
          setEnrollment(data as Enrollment);
        } else {
          setIsEnrolled(false);
          setEnrollment(null);
        }
      } catch (error) {
        console.error("수강 정보 조회 오류:", error);
        setIsEnrolled(false);
        setEnrollment(null);
      } finally {
        setLoading(false);
      }
    }

    checkEnrollment();
  }, [user, courseId]);

  return { isEnrolled, enrollment, loading };
}

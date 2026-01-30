import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  category: string;
  duration: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("강좌 목록 조회 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, error, refetch: fetchCourses };
}

export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) {
        setLoading(false);
        return;
      }

      // Prevent 400 errors when a non-UUID route param is used (e.g. legacy mock id "1")
      if (!isUuid(courseId)) {
        setCourse(null);
        setError("유효하지 않은 강좌 ID");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .maybeSingle();

        if (error) throw error;
        setCourse(data);
      } catch (err) {
        console.error("강좌 조회 실패:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}

export async function createCourse(courseData: Omit<Course, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCourse(courseId: string, courseData: Partial<Course>) {
  const { data, error } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) throw error;
}

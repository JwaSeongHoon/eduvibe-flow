import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  order_index: number;
  duration: string | null;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export function useLessons(courseId: string | undefined) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (err) {
      console.error("레슨 목록 조회 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  return { lessons, loading, error, refetch: fetchLessons };
}

export function useLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .maybeSingle();

        if (error) throw error;
        setLesson(data);
      } catch (err) {
        console.error("레슨 조회 실패:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
}

export async function createLesson(lessonData: Omit<Lesson, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("lessons")
    .insert(lessonData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLesson(lessonId: string, lessonData: Partial<Lesson>) {
  const { data, error } = await supabase
    .from("lessons")
    .update(lessonData)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) throw error;
}

export async function uploadVideo(file: File, courseId: string, lessonId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${courseId}/${lessonId}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from("course-videos")
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  return publicUrl;
}

export function getVideoUrl(path: string) {
  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(path);
  
  return data.publicUrl;
}

export async function getSignedVideoUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("course-videos")
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

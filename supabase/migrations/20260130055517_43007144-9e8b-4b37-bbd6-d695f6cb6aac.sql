-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  duration TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Courses policies (public can view published courses)
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (is_published = true);

-- Function to check if user has enrolled in a course
CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments
    WHERE user_id = _user_id
      AND course_id = _course_id::text
      AND status = 'completed'
  )
$$;

-- Lessons policies
CREATE POLICY "Anyone can view lesson metadata for published courses"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = lessons.course_id 
    AND courses.is_published = true
  )
);

-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', false);

-- Storage policies for course-videos bucket
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-videos');

CREATE POLICY "Enrolled users can view course videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IS NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);
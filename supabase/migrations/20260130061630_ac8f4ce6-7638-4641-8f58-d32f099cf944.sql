-- Allow authenticated users to insert courses
CREATE POLICY "Authenticated users can insert courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update courses
CREATE POLICY "Authenticated users can update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete courses
CREATE POLICY "Authenticated users can delete courses"
ON public.courses
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to view all courses (including unpublished for admin)
CREATE POLICY "Authenticated users can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert lessons
CREATE POLICY "Authenticated users can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update lessons
CREATE POLICY "Authenticated users can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete lessons
CREATE POLICY "Authenticated users can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to view all lessons (for admin)
CREATE POLICY "Authenticated users can view all lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (true);

-- Storage policies for course-videos bucket
CREATE POLICY "Authenticated users can upload course videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can update course videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-videos')
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can delete course videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-videos');
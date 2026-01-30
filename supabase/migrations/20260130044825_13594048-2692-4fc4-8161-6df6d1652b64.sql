-- Fix the overly permissive INSERT policy
-- Drop the current policy and create a proper one
DROP POLICY IF EXISTS "Service role can insert enrollments" ON public.enrollments;

-- Allow inserts only for authenticated users inserting their own enrollment
CREATE POLICY "Users can insert their own enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (auth.uid() = user_id);
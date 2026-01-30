-- Create enrollments table to store course purchases
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  payment_key TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own enrollments (via edge function with service role)
CREATE POLICY "Service role can insert enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_enrollments_user_course ON public.enrollments(user_id, course_id);
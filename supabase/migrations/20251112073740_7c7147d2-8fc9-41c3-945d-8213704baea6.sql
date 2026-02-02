-- Create wellness_resources table
CREATE TABLE public.wellness_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('article', 'meditation', 'scripture')),
  tags TEXT[] DEFAULT '{}',
  duration_minutes INTEGER,
  scripture_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_resources ENABLE ROW LEVEL SECURITY;

-- RLS policy - anyone can view resources
CREATE POLICY "Anyone can view wellness resources"
  ON public.wellness_resources FOR SELECT
  USING (true);

-- Create index for category searches
CREATE INDEX idx_wellness_resources_category ON public.wellness_resources(category);

-- Create index for tag searches
CREATE INDEX idx_wellness_resources_tags ON public.wellness_resources USING GIN(tags);
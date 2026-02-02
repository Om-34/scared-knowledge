-- Create table for study cards (verses users are studying)
CREATE TABLE public.study_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verse_id UUID REFERENCES public.verses(id) ON DELETE CASCADE NOT NULL,
  ease_factor DECIMAL DEFAULT 2.5,
  review_interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

-- Create table for study sessions
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cards_studied INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  session_duration_minutes INTEGER,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_cards
CREATE POLICY "Users can view their own study cards"
ON public.study_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study cards"
ON public.study_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study cards"
ON public.study_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study cards"
ON public.study_cards
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions"
ON public.study_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study sessions"
ON public.study_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_study_cards_user_id ON public.study_cards(user_id);
CREATE INDEX idx_study_cards_next_review ON public.study_cards(next_review_date);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);

-- Function to get due study cards
CREATE OR REPLACE FUNCTION get_due_study_cards(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  card_id UUID,
  verse_id UUID,
  verse_number INTEGER,
  sanskrit_text TEXT,
  transliteration TEXT,
  english_translation TEXT,
  chapter_number INTEGER,
  chapter_title TEXT,
  scripture_name TEXT,
  ease_factor DECIMAL,
  review_interval INTEGER,
  repetitions INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    v.id,
    v.verse_number,
    v.sanskrit_text,
    v.transliteration,
    v.english_translation,
    ch.chapter_number,
    ch.chapter_title,
    ch.scripture_name,
    sc.ease_factor,
    sc.review_interval,
    sc.repetitions
  FROM study_cards sc
  JOIN verses v ON sc.verse_id = v.id
  JOIN scripture_chapters ch ON v.chapter_id = ch.id
  WHERE sc.user_id = p_user_id
    AND sc.next_review_date <= CURRENT_DATE
  ORDER BY sc.next_review_date, sc.created_at
  LIMIT p_limit;
END;
$$;
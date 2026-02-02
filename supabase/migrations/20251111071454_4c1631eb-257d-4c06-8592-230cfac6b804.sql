-- Create table for scripture chapters
CREATE TABLE public.scripture_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scripture_name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  chapter_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(scripture_name, chapter_number)
);

-- Create table for verses
CREATE TABLE public.verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.scripture_chapters(id) ON DELETE CASCADE NOT NULL,
  verse_number INTEGER NOT NULL,
  sanskrit_text TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  commentary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chapter_id, verse_number)
);

-- Create table for user bookmarks
CREATE TABLE public.verse_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verse_id UUID REFERENCES public.verses(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

-- Create table for daily wisdom quotes
CREATE TABLE public.daily_wisdom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID REFERENCES public.verses(id) ON DELETE CASCADE NOT NULL,
  display_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scripture_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wisdom ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scripture_chapters (public read)
CREATE POLICY "Anyone can view scripture chapters"
ON public.scripture_chapters
FOR SELECT
USING (true);

-- RLS Policies for verses (public read)
CREATE POLICY "Anyone can view verses"
ON public.verses
FOR SELECT
USING (true);

-- RLS Policies for verse_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.verse_bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.verse_bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.verse_bookmarks
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
ON public.verse_bookmarks
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for daily_wisdom (public read)
CREATE POLICY "Anyone can view daily wisdom"
ON public.daily_wisdom
FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_verses_chapter_id ON public.verses(chapter_id);
CREATE INDEX idx_verse_bookmarks_user_id ON public.verse_bookmarks(user_id);
CREATE INDEX idx_verse_bookmarks_verse_id ON public.verse_bookmarks(verse_id);
CREATE INDEX idx_daily_wisdom_date ON public.daily_wisdom(display_date);

-- Create function to search verses
CREATE OR REPLACE FUNCTION search_verses(search_term TEXT)
RETURNS TABLE (
  verse_id UUID,
  chapter_number INTEGER,
  chapter_title TEXT,
  verse_number INTEGER,
  sanskrit_text TEXT,
  transliteration TEXT,
  english_translation TEXT,
  commentary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    sc.chapter_number,
    sc.chapter_title,
    v.verse_number,
    v.sanskrit_text,
    v.transliteration,
    v.english_translation,
    v.commentary
  FROM verses v
  JOIN scripture_chapters sc ON v.chapter_id = sc.id
  WHERE 
    v.english_translation ILIKE '%' || search_term || '%'
    OR v.transliteration ILIKE '%' || search_term || '%'
    OR v.commentary ILIKE '%' || search_term || '%'
    OR sc.chapter_title ILIKE '%' || search_term || '%'
  ORDER BY sc.chapter_number, v.verse_number;
END;
$$ LANGUAGE plpgsql STABLE;
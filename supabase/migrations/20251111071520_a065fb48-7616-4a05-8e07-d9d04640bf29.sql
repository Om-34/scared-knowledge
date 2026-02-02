-- Fix the search_verses function to include proper search_path
DROP FUNCTION IF EXISTS search_verses(TEXT);

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
) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
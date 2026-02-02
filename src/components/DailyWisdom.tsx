import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

interface DailyWisdomData {
  verse: {
    sanskrit_text: string;
    transliteration: string;
    english_translation: string;
    verse_number: number;
  };
  chapter: {
    chapter_number: number;
    chapter_title: string;
  };
}

export const DailyWisdom = () => {
  const [wisdom, setWisdom] = useState<DailyWisdomData | null>(null);

  useEffect(() => {
    fetchDailyWisdom();
  }, []);

  const fetchDailyWisdom = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if there's a daily wisdom entry for today
      let { data: dailyData, error: dailyError } = await supabase
        .from("daily_wisdom")
        .select(`
          verse_id,
          verses!inner (
            id,
            verse_number,
            sanskrit_text,
            transliteration,
            english_translation,
            chapter_id,
            scripture_chapters!inner (
              chapter_number,
              chapter_title
            )
          )
        `)
        .eq("display_date", today)
        .maybeSingle();

      // If no entry exists for today, create one with a random verse
      if (dailyError || !dailyData) {
        const { data: randomVerse } = await supabase
          .from("verses")
          .select(`
            id,
            verse_number,
            sanskrit_text,
            transliteration,
            english_translation,
            chapter_id,
            scripture_chapters!inner (
              chapter_number,
              chapter_title
            )
          `)
          .limit(100);

        if (randomVerse && randomVerse.length > 0) {
          const verse = randomVerse[Math.floor(Math.random() * randomVerse.length)];

          // Insert the daily wisdom entry
          await supabase.from("daily_wisdom").insert({
            verse_id: verse.id,
            display_date: today,
          });

          const chapterData = Array.isArray(verse.scripture_chapters) 
            ? verse.scripture_chapters[0] 
            : verse.scripture_chapters;

          setWisdom({
            verse: {
              sanskrit_text: verse.sanskrit_text,
              transliteration: verse.transliteration,
              english_translation: verse.english_translation,
              verse_number: verse.verse_number,
            },
            chapter: {
              chapter_number: chapterData.chapter_number,
              chapter_title: chapterData.chapter_title,
            },
          });
        }
      } else if (dailyData) {
        const verseData = dailyData.verses;
        const chapterData = Array.isArray(verseData.scripture_chapters)
          ? verseData.scripture_chapters[0]
          : verseData.scripture_chapters;

        setWisdom({
          verse: {
            sanskrit_text: verseData.sanskrit_text,
            transliteration: verseData.transliteration,
            english_translation: verseData.english_translation,
            verse_number: verseData.verse_number,
          },
          chapter: {
            chapter_number: chapterData.chapter_number,
            chapter_title: chapterData.chapter_title,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching daily wisdom:", error);
    }
  };

  if (!wisdom) {
    return null;
  }

  return (
    <Card className="p-8 bg-gradient-sunrise text-primary-foreground shadow-glow">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6" />
        <h3 className="text-2xl font-bold">Today's Divine Wisdom</h3>
      </div>

      <div className="space-y-4">
        <div className="text-sm opacity-90">
          Chapter {wisdom.chapter.chapter_number}: {wisdom.chapter.chapter_title} - Verse{" "}
          {wisdom.verse.verse_number}
        </div>

        <div className="text-xl font-serif mb-2">{wisdom.verse.sanskrit_text}</div>

        <div className="text-sm italic opacity-90 mb-4">{wisdom.verse.transliteration}</div>

        <div className="text-lg leading-relaxed border-l-4 border-primary-foreground/30 pl-4">
          {wisdom.verse.english_translation}
        </div>
      </div>
    </Card>
  );
};

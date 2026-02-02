import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bookmark, BookmarkCheck, Plus } from "lucide-react";
import { User } from "@supabase/supabase-js";
import VerseAudioPlayer from "@/components/VerseAudioPlayer";

interface Verse {
  id: string;
  verse_number: number;
  sanskrit_text: string;
  transliteration: string;
  english_translation: string;
  commentary: string;
}

interface Chapter {
  chapter_number: number;
  chapter_title: string;
  chapter_summary: string;
}

const ChapterPage = () => {
  const { chapterNumber, scriptureName } = useParams();
  const decodedScriptureName = scriptureName ? decodeURIComponent(scriptureName) : "Bhagavad Gita";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const searchResults = location.state?.searchResults;
  const searchTerm = location.state?.searchTerm;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chapterNumber) {
      fetchChapterData();
      if (user) {
        fetchBookmarks();
      }
    }
  }, [chapterNumber, user]);

  const fetchChapterData = async () => {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from("scripture_chapters")
        .select("*")
        .eq("scripture_name", decodedScriptureName)
        .eq("chapter_number", parseInt(chapterNumber || "1"))
        .maybeSingle();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      const { data: versesData, error: versesError } = await supabase
        .from("verses")
        .select("*")
        .eq("chapter_id", chapterData.id)
        .order("verse_number");

      if (versesError) throw versesError;
      setVerses(versesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("verse_bookmarks")
        .select("verse_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setBookmarkedVerses(new Set(data.map((b) => b.verse_id)));
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleAddToStudy = async (verseId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add verses to your study deck",
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase.from("study_cards").insert({
        user_id: user.id,
        verse_id: verseId,
        next_review_date: new Date().toISOString().split("T")[0],
      });

      if (error) {
        // If it's a duplicate error, it's already in the deck
        if (error.code === "23505") {
          toast({
            title: "Already in study deck",
            description: "This verse is already in your study deck",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Added to study deck",
        description: "Verse added to your study deck",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleBookmark = async (verseId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark verses",
      });
      navigate("/auth");
      return;
    }

    const isBookmarked = bookmarkedVerses.has(verseId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("verse_bookmarks")
          .delete()
          .eq("verse_id", verseId)
          .eq("user_id", user.id);

        if (error) throw error;

        setBookmarkedVerses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(verseId);
          return newSet;
        });

        toast({
          title: "Bookmark removed",
        });
      } else {
        const { error } = await supabase.from("verse_bookmarks").insert({
          verse_id: verseId,
          user_id: user.id,
        });

        if (error) throw error;

        setBookmarkedVerses((prev) => new Set([...prev, verseId]));

        toast({
          title: "Verse bookmarked",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button variant="ghost" onClick={() => navigate(`/scripture/${encodeURIComponent(decodedScriptureName)}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chapters
        </Button>

        {chapter && (
          <div className="text-center mb-12">
            <div className="text-sm text-accent font-semibold mb-2">
              Chapter {chapter.chapter_number}
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {chapter.chapter_title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {chapter.chapter_summary}
            </p>
            {searchTerm && (
              <div className="mt-4 text-sm text-accent">
                Showing search results for: "{searchTerm}"
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          {verses.map((verse) => (
            <Card key={verse.id} className="p-6 border-2 border-border shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-accent">Verse {verse.verse_number}</div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddToStudy(verse.id)}
                    className="hover:scale-110 transition-transform"
                    title="Add to study deck"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(verse.id)}
                    className="hover:scale-110 transition-transform"
                  >
                    {bookmarkedVerses.has(verse.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl text-secondary font-serif">
                      {verse.sanskrit_text}
                    </div>
                    <VerseAudioPlayer 
                      text={verse.sanskrit_text}
                      transliteration={verse.transliteration}
                      type="sanskrit"
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground italic">
                      {verse.transliteration}
                    </div>
                    <VerseAudioPlayer 
                      text={verse.transliteration}
                      transliteration={verse.transliteration}
                      type="transliteration"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg text-foreground leading-relaxed flex-1">
                      {verse.english_translation}
                    </p>
                    <VerseAudioPlayer 
                      text={verse.english_translation}
                      transliteration={verse.transliteration}
                      type="translation"
                      size="sm"
                    />
                  </div>
                </div>

                {verse.commentary && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm font-semibold text-accent mb-2">Commentary</div>
                    <p className="text-muted-foreground">{verse.commentary}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface BookmarkedVerse {
  id: string;
  verse_id: string;
  notes: string | null;
  verses: {
    verse_number: number;
    sanskrit_text: string;
    english_translation: string;
    chapter_id: string;
    scripture_chapters: {
      chapter_number: number;
      chapter_title: string;
    };
  };
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("verse_bookmarks")
        .select(`
          id,
          verse_id,
          notes,
          verses (
            verse_number,
            sanskrit_text,
            english_translation,
            chapter_id,
            scripture_chapters (
              chapter_number,
              chapter_title
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
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

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from("verse_bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (error) throw error;

      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast({
        title: "Bookmark removed",
      });
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
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-sunrise bg-clip-text text-transparent">
            My Bookmarked Verses
          </h1>
          <p className="text-lg text-muted-foreground">
            {bookmarks.length} verse{bookmarks.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't bookmarked any verses yet.
            </p>
            <Button onClick={() => navigate("/scriptures")}>
              Explore Scriptures
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="p-6 border-2 border-border shadow-soft">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-accent font-semibold">
                    Chapter {bookmark.verses.scripture_chapters.chapter_number}:{" "}
                    {bookmark.verses.scripture_chapters.chapter_title} - Verse{" "}
                    {bookmark.verses.verse_number}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(bookmark.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-lg text-secondary font-serif">
                    {bookmark.verses.sanskrit_text}
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-foreground leading-relaxed">
                      {bookmark.verses.english_translation}
                    </p>
                  </div>

                  {bookmark.notes && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm font-semibold text-accent mb-2">Your Notes</div>
                      <p className="text-muted-foreground">{bookmark.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;

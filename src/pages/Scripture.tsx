import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Book, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Chapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  chapter_summary: string;
}

const scriptureInfo: Record<string, { title: string; description: string }> = {
  "Bhagavad Gita": {
    title: "Bhagavad Gita",
    description: "The Song of God - 700 verses of timeless wisdom"
  },
  "Upanishads": {
    title: "Upanishads",
    description: "Ancient philosophical texts exploring consciousness and reality"
  },
  "Ramayana": {
    title: "Ramayana",
    description: "The epic tale of Lord Rama illustrating dharma and devotion"
  },
  "Vedas": {
    title: "Vedas",
    description: "The oldest scriptures containing hymns and wisdom from ancient sages"
  }
};

const Scripture = () => {
  const { scriptureName } = useParams<{ scriptureName: string }>();
  const decodedName = scriptureName ? decodeURIComponent(scriptureName) : "Bhagavad Gita";
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const info = scriptureInfo[decodedName] || scriptureInfo["Bhagavad Gita"];

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
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from("scripture_chapters")
        .select("*")
        .eq("scripture_name", decodedName)
        .order("chapter_number");

      if (error) throw error;
      setChapters(data || []);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchChapters();
      return;
    }

    try {
      const { data, error } = await supabase.rpc("search_verses", {
        search_term: searchTerm,
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        navigate(`/scripture/${encodeURIComponent(decodedName)}/chapter/${data[0].chapter_number}`, { 
          state: { searchResults: data, searchTerm } 
        });
      } else {
        toast({
          title: "No results",
          description: "No verses found matching your search.",
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

  const handleAddToStudy = async (chapterId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add verses to your study deck",
      });
      navigate("/auth");
      return;
    }

    try {
      // Get all verses from this chapter
      const { data: verses, error: versesError } = await supabase
        .from("verses")
        .select("id")
        .eq("chapter_id", chapterId);

      if (versesError) throw versesError;

      if (!verses || verses.length === 0) {
        toast({
          title: "No verses found",
          description: "This chapter doesn't have any verses yet.",
        });
        return;
      }

      // Add each verse as a study card
      const studyCards = verses.map((verse) => ({
        user_id: user.id,
        verse_id: verse.id,
        next_review_date: new Date().toISOString().split("T")[0],
      }));

      const { error: insertError } = await supabase
        .from("study_cards")
        .upsert(studyCards, { onConflict: "user_id,verse_id" });

      if (insertError) throw insertError;

      toast({
        title: "Added to study deck",
        description: `${verses.length} verses added to your study deck`,
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-sunrise bg-clip-text text-transparent">
            {info.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {info.description}
          </p>

          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="Search verses by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group border-2 border-border"
              onClick={() => navigate(`/scripture/${encodeURIComponent(decodedName)}/chapter/${chapter.chapter_number}`)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-sunrise group-hover:scale-110 transition-transform duration-300">
                  <Book className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-accent font-semibold mb-1">
                    Chapter {chapter.chapter_number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {chapter.chapter_title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {chapter.chapter_summary}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToStudy(chapter.id);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Study
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scripture;

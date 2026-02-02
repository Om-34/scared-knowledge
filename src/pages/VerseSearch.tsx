import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Book, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VerseAudioPlayer from "@/components/VerseAudioPlayer";

const VerseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [activeSearch, setActiveSearch] = useState("");

  // Fetch chapters for filter
  const { data: chapters } = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scripture_chapters")
        .select("*")
        .eq("scripture_name", "Bhagavad Gita")
        .order("chapter_number");
      
      if (error) throw error;
      return data;
    },
  });

  // Search verses
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["verse-search", activeSearch, selectedChapter],
    queryFn: async () => {
      if (!activeSearch) return [];

      const { data, error } = await supabase.rpc("search_verses", {
        search_term: activeSearch,
      });

      if (error) throw error;

      // Filter by chapter if selected
      if (selectedChapter !== "all") {
        return data.filter(
          (verse: any) => verse.chapter_number === parseInt(selectedChapter)
        );
      }

      return data;
    },
    enabled: !!activeSearch,
  });

  const handleSearch = () => {
    setActiveSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Verse Search
            </h1>
            <p className="text-muted-foreground">
              Search across all 700 verses of the Bhagavad Gita
            </p>
          </div>

          {/* Search Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Verses
              </CardTitle>
              <CardDescription>
                Find verses by keyword, theme, or Sanskrit text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by keyword, translation, or commentary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chapters</SelectItem>
                    {chapters?.map((chapter) => (
                      <SelectItem
                        key={chapter.id}
                        value={chapter.chapter_number.toString()}
                      >
                        Chapter {chapter.chapter_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && searchResults && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {searchResults.length} verse{searchResults.length !== 1 ? "s" : ""}
                </p>
              </div>

              {searchResults.map((verse: any) => (
                <Card key={verse.verse_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Book className="h-4 w-4 text-primary" />
                          {verse.chapter_title}
                        </CardTitle>
                        <CardDescription>
                          Chapter {verse.chapter_number}, Verse {verse.verse_number}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {verse.chapter_number}:{verse.verse_number}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-primary">
                          {verse.sanskrit_text}
                        </p>
                        <VerseAudioPlayer 
                          text={verse.sanskrit_text}
                          transliteration={verse.transliteration}
                          type="sanskrit"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground italic">
                          {verse.transliteration}
                        </p>
                        <VerseAudioPlayer 
                          text={verse.transliteration}
                          transliteration={verse.transliteration}
                          type="transliteration"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-foreground flex-1">{verse.english_translation}</p>
                        <VerseAudioPlayer 
                          text={verse.english_translation}
                          transliteration={verse.transliteration}
                          type="translation"
                          size="sm"
                        />
                      </div>
                      {verse.commentary && (
                        <p className="text-sm text-muted-foreground">
                          {verse.commentary}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && searchResults && searchResults.length === 0 && activeSearch && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No verses found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or adjust your filters
                </p>
              </CardContent>
            </Card>
          )}

          {!activeSearch && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                <p className="text-muted-foreground">
                  Enter keywords to find relevant verses from the Bhagavad Gita
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerseSearch;
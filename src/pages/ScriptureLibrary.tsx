import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen, Sparkles } from "lucide-react";

const scriptures = [
  {
    name: "Bhagavad Gita",
    description: "The Song of God - A conversation between Krishna and Arjuna on dharma, karma, and liberation",
    chapters: 18,
    verses: 700,
    path: "/scripture/Bhagavad%20Gita",
    color: "from-primary via-secondary to-accent",
  },
];

const ScriptureLibrary = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Sacred Scripture Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore ancient wisdom texts with translations, commentaries, and audio narration
            </p>
          </div>

          {/* Featured Scripture */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-pulse" />
            <div className="relative flex items-center gap-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Featured Scripture</h2>
            </div>
            <p className="text-muted-foreground relative">
              Begin your spiritual journey with the timeless wisdom of the Bhagavad Gita
            </p>
          </div>

          {/* Scripture Grid */}
          <div className="grid gap-6">
            {scriptures.map((scripture) => (
              <Card 
                key={scripture.name}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(scripture.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${scripture.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-3xl flex items-center gap-3 group-hover:text-primary transition-colors">
                        <BookOpen className="h-8 w-8" />
                        {scripture.name}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {scripture.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      <span>{scripture.chapters} Chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>{scripture.verses} Verses</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(scripture.path);
                      }}
                      className="flex-1"
                    >
                      Read Scripture
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/search");
                      }}
                    >
                      Search Verses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-muted-foreground" />
                Coming Soon
              </CardTitle>
              <CardDescription>
                More sacred texts will be added to the library, including Upanishads, Yoga Sutras, and other spiritual wisdom traditions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScriptureLibrary;
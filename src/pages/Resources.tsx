import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Book, Heart, Sparkles, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Resource = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: "article" | "meditation" | "scripture";
  tags: string[];
  duration_minutes?: number;
  scripture_reference?: string;
};

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wellness_resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading resources:", error);
    } else {
      setResources((data || []) as Resource[]);
    }
    setLoading(false);
  };

  const filteredResources =
    activeCategory === "all"
      ? resources
      : resources.filter((r) => r.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "article":
        return <Book className="h-5 w-5" />;
      case "meditation":
        return <Heart className="h-5 w-5" />;
      case "scripture":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Book className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "article":
        return "bg-blue-500/10 text-blue-500";
      case "meditation":
        return "bg-purple-500/10 text-purple-500";
      case "scripture":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-sunrise bg-clip-text text-transparent">
            Wellness Resources
          </h1>
          <p className="text-muted-foreground text-lg">
            Curated articles, meditation guides, and scripture passages for your mental and spiritual wellness
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
            <TabsTrigger value="scripture">Scripture</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </Card>
                  ))
                ) : filteredResources.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No resources available yet.</p>
                  </Card>
                ) : (
                  filteredResources.map((resource) => (
                    <Card
                      key={resource.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedResource?.id === resource.id
                          ? "border-primary shadow-md"
                          : ""
                      }`}
                      onClick={() => setSelectedResource(resource)}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                          {getCategoryIcon(resource.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {resource.duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.duration_minutes} min
                          </Badge>
                        )}
                        {resource.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-2">
            {selectedResource ? (
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(selectedResource.category)}`}>
                      {getCategoryIcon(selectedResource.category)}
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2 capitalize">
                        {selectedResource.category}
                      </Badge>
                      <h2 className="text-3xl font-bold">{selectedResource.title}</h2>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-lg mb-4">
                    {selectedResource.description}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap mb-6">
                    {selectedResource.duration_minutes && (
                      <Badge variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        {selectedResource.duration_minutes} minutes
                      </Badge>
                    )}
                    {selectedResource.scripture_reference && (
                      <Badge variant="outline">
                        <Book className="h-4 w-4 mr-2" />
                        {selectedResource.scripture_reference}
                      </Badge>
                    )}
                  </div>

                  {selectedResource.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-6">
                      {selectedResource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {selectedResource.content}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center h-[600px] text-center">
                <div className="bg-gradient-sunrise p-6 rounded-full mb-4 opacity-50">
                  <Book className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a Resource</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose an article, meditation guide, or scripture passage from the list to begin your wellness journey
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resources;

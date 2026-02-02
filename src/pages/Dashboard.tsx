import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Heart, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [studyStats, setStudyStats] = useState({ total: 0, thisWeek: 0 });
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load mood logs
    const { data: moods } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true })
      .limit(10);

    const moodMap = { anxious: 1, sad: 2, neutral: 3, content: 4, peaceful: 5 };
    const moodChartData = moods?.map((m) => ({
      date: new Date(m.logged_at).toLocaleDateString(),
      before: moodMap[m.mood_before as keyof typeof moodMap] || 3,
      after: moodMap[m.mood_after as keyof typeof moodMap] || 3,
    })) || [];

    setMoodData(moodChartData);

    // Load study stats
    const { data: cards } = await supabase
      .from("study_cards")
      .select("*")
      .eq("user_id", user.id);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = cards?.filter((c) => new Date(c.last_reviewed_at || 0) > weekAgo).length || 0;

    setStudyStats({ total: cards?.length || 0, thisWeek });

    // Load recommended resources
    const { data: res } = await supabase
      .from("wellness_resources")
      .select("*")
      .limit(3);

    setResources(res || []);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="p-6">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Your Wellness Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your progress and continue your journey</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Mood Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{moodData.length}</div>
              <p className="text-sm text-muted-foreground">Sessions logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Study Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{studyStats.total}</div>
              <p className="text-sm text-muted-foreground">{studyStats.thisWeek} reviewed this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={studyStats.thisWeek > 0 ? 65 : 0} className="mb-2" />
              <p className="text-sm text-muted-foreground">Keep going!</p>
            </CardContent>
          </Card>
        </div>

        {moodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mood Journey</CardTitle>
              <CardDescription>Track how your mood improves through conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 6]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="before" stroke="hsl(var(--muted-foreground))" name="Before" />
                  <Line type="monotone" dataKey="after" stroke="hsl(var(--primary))" name="After" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Recommended for You
            </CardTitle>
            <CardDescription>Based on your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.map((r) => (
                <div key={r.id} className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                  <Button onClick={() => navigate("/resources")}>View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

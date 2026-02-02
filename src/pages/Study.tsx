import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FlashCard } from "@/components/FlashCard";
import { StudyProgress } from "@/components/StudyProgress";
import { Navbar } from "@/components/Navbar";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";

interface StudyCard {
  card_id: string;
  verse_id: string;
  verse_number: number;
  sanskrit_text: string;
  transliteration: string;
  english_translation: string;
  chapter_number: number;
  chapter_title: string;
  scripture_name: string;
  ease_factor: number;
  review_interval: number;
  repetitions: number;
}

const Study = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dueCards, setDueCards] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [studiedToday, setStudiedToday] = useState(0);
  const [correctToday, setCorrectToday] = useState(0);
  const [sessionStartTime] = useState(Date.now());
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
      loadStudyData();
    }
  }, [user]);

  const loadStudyData = async () => {
    if (!user) return;

    try {
      // Get due cards
      const { data: cards, error: cardsError } = await supabase.rpc("get_due_study_cards", {
        p_user_id: user.id,
        p_limit: 20,
      });

      if (cardsError) throw cardsError;
      setDueCards(cards || []);

      // Get total cards count
      const { count, error: countError } = await supabase
        .from("study_cards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;
      setTotalCards(count || 0);

      // Get today's session stats
      const today = new Date().toISOString().split("T")[0];
      const { data: sessions, error: sessionError } = await supabase
        .from("study_sessions")
        .select("cards_studied, cards_correct")
        .eq("user_id", user.id)
        .eq("session_date", today);

      if (sessionError) throw sessionError;

      if (sessions && sessions.length > 0) {
        const totalStudied = sessions.reduce((sum, s) => sum + (s.cards_studied || 0), 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + (s.cards_correct || 0), 0);
        setStudiedToday(totalStudied);
        setCorrectToday(totalCorrect);
      }
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

  const calculateNextReview = (
    difficulty: "again" | "hard" | "good" | "easy",
    card: StudyCard
  ): { interval: number; easeFactor: number; repetitions: number } => {
    let newEaseFactor = card.ease_factor;
    let newInterval = card.review_interval;
    let newRepetitions = card.repetitions;

    switch (difficulty) {
      case "again":
        newRepetitions = 0;
        newInterval = 1;
        newEaseFactor = Math.max(1.3, card.ease_factor - 0.2);
        break;

      case "hard":
        newRepetitions = card.repetitions + 1;
        newInterval = Math.max(1, Math.ceil(card.review_interval * 1.2));
        newEaseFactor = Math.max(1.3, card.ease_factor - 0.15);
        break;

      case "good":
        newRepetitions = card.repetitions + 1;
        if (newRepetitions === 1) {
          newInterval = 4;
        } else {
          newInterval = Math.ceil(card.review_interval * card.ease_factor);
        }
        break;

      case "easy":
        newRepetitions = card.repetitions + 1;
        newInterval = Math.ceil(card.review_interval * card.ease_factor * 1.3);
        newEaseFactor = card.ease_factor + 0.15;
        break;
    }

    return {
      interval: newInterval,
      easeFactor: Number(newEaseFactor.toFixed(2)),
      repetitions: newRepetitions,
    };
  };

  const handleCardRating = async (difficulty: "again" | "hard" | "good" | "easy") => {
    if (!user || !dueCards[currentCardIndex]) return;

    const currentCard = dueCards[currentCardIndex];
    const { interval, easeFactor, repetitions } = calculateNextReview(difficulty, currentCard);

    try {
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      const { error: updateError } = await supabase
        .from("study_cards")
        .update({
          ease_factor: easeFactor,
          review_interval: interval,
          repetitions: repetitions,
          next_review_date: nextReviewDate.toISOString().split("T")[0],
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", currentCard.card_id);

      if (updateError) throw updateError;

      // Track session
      const isCorrect = difficulty === "good" || difficulty === "easy";
      setStudiedToday((prev) => prev + 1);
      if (isCorrect) setCorrectToday((prev) => prev + 1);

      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        await saveSession();
        toast({
          title: "Session Complete! 🎉",
          description: `You've reviewed all ${dueCards.length} cards due today.`,
        });
        loadStudyData();
        setCurrentCardIndex(0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveSession = async () => {
    if (!user) return;

    const durationMinutes = Math.round((Date.now() - sessionStartTime) / 60000);

    try {
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        cards_studied: studiedToday,
        cards_correct: correctToday,
        session_duration_minutes: durationMinutes,
      });
    } catch (error: any) {
      console.error("Error saving session:", error);
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
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-sunrise bg-clip-text text-transparent">
            Study Mode
          </h1>
          <p className="text-lg text-muted-foreground">
            Master sacred verses through spaced repetition
          </p>
        </div>

        <StudyProgress
          totalCards={totalCards}
          dueCards={dueCards.length}
          studiedToday={studiedToday}
          correctToday={correctToday}
          streak={0}
        />

        <div className="mt-12">
          {dueCards.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-foreground">
                  You're all caught up!
                </h2>
                <p className="text-muted-foreground">
                  No cards are due for review right now. Add more verses to your study deck or
                  come back tomorrow.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <Button onClick={() => navigate("/scriptures")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Scriptures
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/bookmarks")}>
                    Add from Bookmarks
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="mb-6 text-center text-muted-foreground">
                Card {currentCardIndex + 1} of {dueCards.length}
              </div>

              <FlashCard
                verseNumber={dueCards[currentCardIndex].verse_number}
                sanskritText={dueCards[currentCardIndex].sanskrit_text}
                transliteration={dueCards[currentCardIndex].transliteration}
                englishTranslation={dueCards[currentCardIndex].english_translation}
                chapterNumber={dueCards[currentCardIndex].chapter_number}
                chapterTitle={dueCards[currentCardIndex].chapter_title}
                scriptureName={dueCards[currentCardIndex].scripture_name}
                onRate={handleCardRating}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;

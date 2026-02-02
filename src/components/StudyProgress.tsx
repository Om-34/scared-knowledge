import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

interface StudyProgressProps {
  totalCards: number;
  dueCards: number;
  studiedToday: number;
  correctToday: number;
  streak: number;
}

export const StudyProgress = ({
  totalCards,
  dueCards,
  studiedToday,
  correctToday,
  streak,
}: StudyProgressProps) => {
  const accuracyPercentage = studiedToday > 0 ? Math.round((correctToday / studiedToday) * 100) : 0;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="p-6 border-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{dueCards}</div>
            <div className="text-sm text-muted-foreground">Cards due</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-secondary/10">
            <TrendingUp className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalCards}</div>
            <div className="text-sm text-muted-foreground">Total cards</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-accent/10">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{accuracyPercentage}%</div>
            <div className="text-sm text-muted-foreground">Today's accuracy</div>
          </div>
        </div>
        <Progress value={accuracyPercentage} className="mt-3" />
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-sunrise">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{streak}</div>
            <div className="text-sm text-muted-foreground">Day streak</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

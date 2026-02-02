import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Meh, Frown, Heart, Zap } from "lucide-react";

type MoodType = "great" | "good" | "okay" | "stressed" | "sad";

interface MoodSelectorProps {
  onSelectMood: (mood: MoodType) => void;
  type: "before" | "after";
}

const moods = [
  { value: "great" as MoodType, label: "Great", icon: Heart, color: "text-green-500" },
  { value: "good" as MoodType, label: "Good", icon: Smile, color: "text-blue-500" },
  { value: "okay" as MoodType, label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "stressed" as MoodType, label: "Stressed", icon: Zap, color: "text-orange-500" },
  { value: "sad" as MoodType, label: "Sad", icon: Frown, color: "text-red-500" },
];

export const MoodSelector = ({ onSelectMood, type }: MoodSelectorProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4">
        How are you feeling {type === "before" ? "right now" : "after this session"}?
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            onClick={() => onSelectMood(mood.value)}
            variant="outline"
            className="flex flex-col h-auto py-4 hover:border-primary"
          >
            <mood.icon className={`h-8 w-8 mb-2 ${mood.color}`} />
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

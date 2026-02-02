import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, X } from "lucide-react";

interface FlashCardProps {
  verseNumber: number;
  sanskritText: string;
  transliteration: string;
  englishTranslation: string;
  chapterNumber: number;
  chapterTitle: string;
  scriptureName: string;
  onRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
}

export const FlashCard = ({
  verseNumber,
  sanskritText,
  transliteration,
  englishTranslation,
  chapterNumber,
  chapterTitle,
  scriptureName,
  onRate,
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center text-sm text-muted-foreground">
        {scriptureName} - Chapter {chapterNumber}: {chapterTitle} - Verse {verseNumber}
      </div>

      <Card className="relative h-[400px] cursor-pointer perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div
            className={`absolute w-full h-full p-8 flex flex-col items-center justify-center bg-gradient-sunrise text-primary-foreground rounded-lg backface-hidden ${
              isFlipped ? "invisible" : "visible"
            }`}
          >
            <div className="text-center space-y-6">
              <div className="text-3xl font-serif mb-4">{sanskritText}</div>
              <div className="text-lg italic opacity-90">{transliteration}</div>
              <div className="mt-6 text-sm opacity-75">Click to reveal translation</div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className={`absolute w-full h-full p-8 flex flex-col justify-between bg-card border-2 border-border rounded-lg backface-hidden rotate-y-180 ${
              isFlipped ? "visible" : "invisible"
            }`}
          >
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-foreground text-center leading-relaxed">
                {englishTranslation}
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Click to flip back
            </div>
          </div>
        </div>
      </Card>

      {isFlipped && (
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm font-medium text-foreground mb-2">
            How well did you know this verse?
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-2 hover:border-destructive hover:bg-destructive/10"
              onClick={() => onRate("again")}
            >
              <X className="w-5 h-5 mb-1 text-destructive" />
              <span className="text-xs">Again</span>
              <span className="text-xs text-muted-foreground">&lt;1 day</span>
            </Button>

            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-2 hover:border-orange-500 hover:bg-orange-500/10"
              onClick={() => onRate("hard")}
            >
              <RotateCcw className="w-5 h-5 mb-1 text-orange-500" />
              <span className="text-xs">Hard</span>
              <span className="text-xs text-muted-foreground">2 days</span>
            </Button>

            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-2 hover:border-primary hover:bg-primary/10"
              onClick={() => onRate("good")}
            >
              <Check className="w-5 h-5 mb-1 text-primary" />
              <span className="text-xs">Good</span>
              <span className="text-xs text-muted-foreground">4 days</span>
            </Button>

            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-2 hover:border-green-500 hover:bg-green-500/10"
              onClick={() => onRate("easy")}
            >
              <Check className="w-5 h-5 mb-1 text-green-500" />
              <span className="text-xs">Easy</span>
              <span className="text-xs text-muted-foreground">7+ days</span>
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

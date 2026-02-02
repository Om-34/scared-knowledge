import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ScriptureCardProps {
  title: string;
  description: string;
  verses: number;
  onClick?: () => void;
}

export const ScriptureCard = ({ title, description, verses, onClick }: ScriptureCardProps) => {
  return (
    <Card 
      className="p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group border-2 border-border bg-card"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-gradient-sunrise group-hover:scale-110 transition-transform duration-300">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>
          <span className="text-sm text-accent font-medium">{verses} verses</span>
        </div>
      </div>
    </Card>
  );
};

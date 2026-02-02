import { ScriptureCard } from "@/components/ScriptureCard";
import { MentalHealthChat } from "@/components/MentalHealthChat";
import { DailyWisdom } from "@/components/DailyWisdom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/spiritual-hero.jpg";

const Index = () => {
  const navigate = useNavigate();
  const scriptures = [
    {
      title: "Bhagavad Gita",
      description: "The sacred dialogue between Krishna and Arjuna, teaching paths to self-realization and duty.",
      verses: 700,
    },
    {
      title: "Upanishads",
      description: "Ancient philosophical texts exploring the nature of reality, consciousness, and the self.",
      verses: 1000,
    },
    {
      title: "Ramayana",
      description: "The epic tale of Lord Rama, illustrating dharma, devotion, and righteous living.",
      verses: 24000,
    },
    {
      title: "Vedas",
      description: "The oldest scriptures containing hymns, rituals, and wisdom from ancient sages.",
      verses: 20000,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Ancient Wisdom, Modern Peace</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-sunrise bg-clip-text text-transparent">
            Sacred Knowledge Portal
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore timeless scriptures and find mental peace through the wisdom of ancient India,
            guided by compassionate AI support.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="shadow-glow" onClick={() => document.getElementById("scriptures")?.scrollIntoView({ behavior: "smooth" })}>
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Scriptures
            </Button>
            <Button size="lg" variant="secondary" onClick={() => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" })}>
              <Heart className="w-5 h-5 mr-2" />
              Start Healing Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Daily Wisdom */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <DailyWisdom />
      </section>

      {/* Scripture Library */}
      <section id="scriptures" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Sacred Scriptures</h2>
          <p className="text-xl text-muted-foreground">
            Discover profound wisdom from ancient Indian texts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {scriptures.map((scripture) => (
            <ScriptureCard 
              key={scripture.title} 
              {...scripture} 
              onClick={() => navigate(`/scripture/${encodeURIComponent(scripture.title)}`)}
            />
          ))}
        </div>
      </section>

      {/* Mental Health Chat */}
      <section id="chat" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Your Mental Health Companion</h2>
          <p className="text-xl text-muted-foreground">
            Find peace and guidance through AI-powered support infused with spiritual wisdom
          </p>
        </div>

        <MentalHealthChat />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Sacred Knowledge Portal. May peace and wisdom guide your path.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

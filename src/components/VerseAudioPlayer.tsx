import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerseAudioPlayerProps {
  text: string;
  transliteration: string;
  type: "sanskrit" | "transliteration" | "translation";
  size?: "sm" | "md";
}

const VerseAudioPlayer = ({ text, transliteration, type, size = "md" }: VerseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const getTextToSpeak = () => {
    switch (type) {
      case "sanskrit":
      case "transliteration":
        return transliteration; // Use transliteration for proper pronunciation
      case "translation":
        return text;
      default:
        return text;
    }
  };

  const handlePlayAudio = async () => {
    try {
      // If already playing, stop
      if (isPlaying && audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);

      const textToSpeak = getTextToSpeak();

      // Call edge function to generate speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: textToSpeak,
          voice: 'Aria' // Using a clear, neutral voice
        },
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to audio
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audioElement = new Audio(audioUrl);
      
      audioElement.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioElement.onerror = () => {
        toast({
          title: "Playback Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      setAudio(audioElement);
      await audioElement.play();
      setIsPlaying(true);

    } catch (error: any) {
      console.error('Audio generation error:', error);
      toast({
        title: "Audio Generation Failed",
        description: error.message || "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const buttonSize = size === "sm" ? "sm" : "default";

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={handlePlayAudio}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
      {size === "md" && (
        <span className="text-sm">
          {isLoading ? "Loading..." : isPlaying ? "Stop" : "Listen"}
        </span>
      )}
    </Button>
  );
};

export default VerseAudioPlayer;
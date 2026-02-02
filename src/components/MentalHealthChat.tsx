import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MoodSelector } from "./MoodSelector";
import { ConversationHistory } from "./ConversationHistory";
import { useNavigate } from "react-router-dom";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type MoodType = "great" | "good" | "okay" | "stressed" | "sad";

export const MentalHealthChat = () => {
  const [user, setUser] = useState<any>(null);
  const [showMoodBefore, setShowMoodBefore] = useState(false);
  const [showMoodAfter, setShowMoodAfter] = useState(false);
  const [moodBefore, setMoodBefore] = useState<MoodType | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste 🙏 I'm here to support you with compassion and wisdom. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  };

  const loadConversation = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages((data || []) as Message[]);
    setCurrentConversationId(conversationId);
  };

  const createNewConversation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your conversations",
        variant: "destructive",
      });
      navigate("/auth");
      return null;
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: "New Conversation",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }

    await loadConversations();
    return data.id;
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    await supabase
      .from("chat_conversations")
      .update({ title })
      .eq("id", conversationId);
    
    await loadConversations();
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([
        {
          role: "assistant",
          content: "Namaste 🙏 I'm here to support you with compassion and wisdom. How can I help you today?"
        }
      ]);
    }

    await loadConversations();
  };

  const handleMoodBefore = (mood: MoodType) => {
    setMoodBefore(mood);
    setShowMoodBefore(false);
  };

  const handleMoodAfter = async (mood: MoodType) => {
    if (!user || !currentConversationId) return;

    await supabase.from("mood_logs").insert({
      user_id: user.id,
      conversation_id: currentConversationId,
      mood_before: moodBefore!,
      mood_after: mood,
    });

    setShowMoodAfter(false);
    toast({
      title: "Mood logged",
      description: "Your mood has been recorded. Take care of yourself! 💜",
    });
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: "Namaste 🙏 I'm here to support you with compassion and wisdom. How can I help you today?"
      }
    ]);
    setMoodBefore(null);
    setShowMoodBefore(true);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the chat",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Show mood selector for first message in a new conversation
    if (!currentConversationId && !moodBefore) {
      setShowMoodBefore(true);
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create conversation if needed
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation();
        if (!conversationId) {
          setIsLoading(false);
          return;
        }
        setCurrentConversationId(conversationId);
      }

      // Save user message
      await saveMessage(conversationId, "user", userMessage.content);

      // Update title if first message
      if (messages.length === 1) {
        await updateConversationTitle(conversationId, userMessage.content);
      }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      // Save assistant response
      const finalAssistantMessage = messages[messages.length - 1]?.content || "";
      if (finalAssistantMessage) {
        await saveMessage(conversationId, "assistant", finalAssistantMessage);
      }

      // Show mood after dialog after 5 messages
      if (messages.length >= 10 && moodBefore && !showMoodAfter) {
        setTimeout(() => setShowMoodAfter(true), 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (showMoodBefore) {
    return <MoodSelector onSelectMood={handleMoodBefore} type="before" />;
  }

  if (showMoodAfter) {
    return <MoodSelector onSelectMood={handleMoodAfter} type="after" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {user && (
        <div className="md:col-span-1">
          <ConversationHistory
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={loadConversation}
            onDeleteConversation={deleteConversation}
            onNewConversation={startNewChat}
          />
        </div>
      )}
      
      <div className={user ? "md:col-span-2" : "md:col-span-3"}>
        <Card className="h-[600px] flex flex-col bg-card border-2 border-border shadow-soft">
      <div className="p-6 border-b border-border bg-gradient-sunrise">
        <h2 className="text-2xl font-bold text-primary-foreground">Mental Health Companion</h2>
        <p className="text-sm text-primary-foreground/90 mt-1">
          Combining ancient wisdom with modern support
        </p>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-4 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Share what's on your mind..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-[80px] w-[80px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
        </Card>
      </div>
    </div>
  );
};

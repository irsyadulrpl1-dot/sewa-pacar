import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { companions } from "@/data/companions";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

export default function CompanionChat() {
  const { companionId } = useParams<{ companionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companion = companions.find((c) => c.id === companionId);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!companion) {
      navigate("/companions");
      return;
    }

    // For demo purposes, we'll use a mock companion user ID based on companion.id
    // In production, companions would have real user accounts
    const mockCompanionUserId = `companion-${companion.id}`;

    // Fetch existing messages
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${mockCompanionUserId}),and(sender_id.eq.${mockCompanionUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`companion-chat-${companion.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if it's related to this conversation
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === mockCompanionUserId) ||
            (newMessage.sender_id === mockCompanionUserId && newMessage.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, companion, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !companion || !user || sending) return;

    setSending(true);
    const mockCompanionUserId = `companion-${companion.id}`;
    
    // Add optimistic update
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
      sender_id: user.id,
      receiver_id: mockCompanionUserId,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");

    // Simulate companion auto-reply after a delay (for demo)
    setTimeout(async () => {
      const replies = [
        `Hai! Terima kasih sudah menghubungi aku. Ada yang bisa aku bantu?`,
        `Wah senang banget kamu tertarik! Mau booking kapan nih?`,
        `Halo! Aku ${companion.name}. Yuk kita ngobrol dulu 😊`,
        `Oke, kalau mau janjian aku available ${companion.availability} ya!`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMessage: ChatMessage = {
        id: `reply-${Date.now()}`,
        content: randomReply,
        sender_id: mockCompanionUserId,
        receiver_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1500);

    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", { 
        weekday: "long", 
        day: "numeric", 
        month: "long" 
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  if (!companion) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/messages" className="p-2 -ml-2 hover:bg-muted/50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                <div className="w-full h-full rounded-full bg-background overflow-hidden">
                  <img 
                    src={companion.image} 
                    alt={companion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-background" />
            </div>
            
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate">
                {companion.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Online • {companion.city}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-lavender/30">
              <img 
                src={companion.image} 
                alt={companion.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Chat dengan {companion.name}
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              {companion.bio}
            </p>
            <p className="text-xs text-muted-foreground">
              Kirim pesan untuk mulai percakapan!
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {formatDate(msgs[0].created_at)}
                  </span>
                </div>

                {/* Messages for this date */}
                {msgs.map((msg, index) => {
                  const isOwn = msg.sender_id === user?.id;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.02,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                    >
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 shrink-0">
                          <img 
                            src={companion.image} 
                            alt={companion.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? "bg-gradient-to-r from-lavender to-pink text-white rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p className={`text-[10px] mt-1 ${
                          isOwn ? "text-white/70" : "text-muted-foreground"
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 safe-area-bottom">
        <div className="flex gap-2 items-center max-w-2xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Kirim pesan ke ${companion.name}...`}
            className="flex-1 rounded-2xl h-12 bg-muted/50"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            variant="gradient"
            size="icon"
            className="h-12 w-12 rounded-2xl shrink-0"
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

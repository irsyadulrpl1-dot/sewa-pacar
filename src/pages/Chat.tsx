import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useFriends } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/hooks/useProfile";

export default function Chat() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, loading, sendMessage, markAsRead } = useMessages(partnerId);
  const { friends } = useFriends();
  
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if they are friends
    const isFriend = friends.some(f => f.friend?.user_id === partnerId);
    if (!isFriend && friends.length > 0 && partnerId) {
      navigate("/friends");
      return;
    }

    // Fetch partner profile
    if (partnerId) {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", partnerId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPartner(data as Profile);
        });
    }
  }, [user, partnerId, friends, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Mark unread messages as read
    if (messages.length > 0 && user) {
      const unreadIds = messages
        .filter(m => m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [messages, user, markAsRead]);

  const handleSend = async () => {
    if (!message.trim() || !partnerId || sending) return;

    setSending(true);
    const { error } = await sendMessage(message.trim(), partnerId);
    if (!error) {
      setMessage("");
    }
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
  }, {} as Record<string, typeof messages>);

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
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {partner?.avatar_url ? (
                    <img 
                      src={partner.avatar_url} 
                      alt={partner.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {partner?.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-background" />
              )}
            </div>
            
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate">
                {partner?.full_name || "Loading..."}
              </h1>
              <p className="text-xs text-muted-foreground">
                {partner?.is_online ? "Online" : "Offline"}
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-lavender/20 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-2">Belum ada pesan</p>
            <p className="text-sm text-muted-foreground">
              Mulai percakapan dengan {partner?.full_name}!
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
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
                          {isOwn && msg.is_read && " ✓✓"}
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
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4">
        <div className="flex gap-2 items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
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

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useMessages();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Kemarin";
    } else if (days < 7) {
      return date.toLocaleDateString("id-ID", { weekday: "short" });
    } else {
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }
  };

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Pesan 💬
          </h1>
          <p className="text-muted-foreground text-sm">
            Chat dengan teman-temanmu
          </p>
        </motion.div>

        {/* Conversations */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Belum ada pesan</p>
              <p className="text-sm text-muted-foreground">
                Mulai chat dengan teman-temanmu!
              </p>
            </div>
          ) : (
            conversations.map((convo, index) => (
              <motion.div
                key={convo.partnerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/chat/${convo.partnerId}`}
                  className="block glass-card rounded-2xl p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {convo.partner?.avatar_url ? (
                            <img 
                              src={convo.partner.avatar_url} 
                              alt={convo.partner.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {convo.partner?.is_online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-mint rounded-full border-2 border-background" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {convo.partner?.full_name || "Unknown"}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {convo.lastMessage && formatTime(convo.lastMessage.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          convo.unreadCount > 0 
                            ? "text-foreground font-medium" 
                            : "text-muted-foreground"
                        }`}>
                          {convo.lastMessage?.sender_id === user?.id && "Kamu: "}
                          {convo.lastMessage?.content || "Belum ada pesan"}
                        </p>
                        {convo.unreadCount > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                            {convo.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

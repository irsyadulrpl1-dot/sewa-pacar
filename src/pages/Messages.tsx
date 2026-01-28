import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, User, Sparkles, Search, X, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useCompanions } from "@/hooks/useCompanions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading, isConnected } = useMessages();
  const { companions: companionProfiles } = useCompanions({ limit: 50 }); // Fetch companions from database
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Create companion conversations from database
  const companionConversations = useMemo(() => {
    return companionProfiles.map(companion => ({
      id: companion.user_id || companion.id,
      type: "companion" as const,
      partnerId: companion.user_id || companion.id,
      name: companion.name || companion.full_name || "Unknown",
      avatar: companion.avatar_url || companion.image || null,
      city: companion.city || null,
      isOnline: companion.is_online || false,
      lastMessage: null as string | null,
      lastMessageTime: null as string | null,
      unreadCount: 0,
    }));
  }, [companionProfiles]);

  // Combine real conversations with companion conversations from database
  const allConversations = useMemo(() => {
    const realConvos = conversations.map(convo => ({
      id: convo.partnerId,
      type: "user" as const,
      partnerId: convo.partnerId,
      name: convo.partner?.full_name || "Unknown",
      avatar: convo.partner?.avatar_url || null,
      city: convo.partner?.city || null,
      isOnline: convo.partner?.is_online || false,
      lastMessage: convo.lastMessage?.deleted_for_all 
        ? "Pesan ini telah dihapus" 
        : convo.lastMessage?.content || null,
      lastMessageTime: convo.lastMessage?.created_at || null,
      unreadCount: convo.unreadCount,
      isSentByMe: convo.lastMessage?.sender_id === user?.id,
      hasBooking: convo.hasBooking || false, // Flag for booking chat
    }));

    // Filter out companions that already have conversations
    const companionIdsWithMessages = new Set(realConvos.map(c => c.partnerId));
    const companionsWithoutMessages = companionConversations.filter(
      c => !companionIdsWithMessages.has(c.partnerId)
    );

    return [...realConvos, ...companionsWithoutMessages];
  }, [conversations, companionConversations, user?.id]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return allConversations;
    
    const query = searchQuery.toLowerCase();
    return allConversations.filter(convo => 
      convo.name.toLowerCase().includes(query) ||
      convo.city?.toLowerCase().includes(query) ||
      convo.lastMessage?.toLowerCase().includes(query)
    );
  }, [allConversations, searchQuery]);

  const checkBookingBeforeOpen = useCallback(async (partnerId: string) => {
    if (!user || !partnerId) {
      navigate("/auth");
      return;
    }
    try {
      const { data: bookings } = await (supabase as any)
        .from("bookings")
        .select("id, status, created_at, user_id, companion_id")
        .or(`and(user_id.eq.${user.id},companion_id.eq.${partnerId}),and(user_id.eq.${partnerId},companion_id.eq.${user.id})`)
        .order("created_at", { ascending: false });

      const latest = bookings?.[0];
      if (latest?.status === "cancelled") {
        toast.error("Booking telah dibatalkan. Chat ditutup.");
        return;
      }
      navigate(`/chat/${partnerId}`);
    } catch {
      navigate(`/chat/${partnerId}`);
    }
  }, [user, navigate]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
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

  const getConversationLink = (convo: typeof filteredConversations[0]) => {
    // All conversations now use real user_id, so we can use the same route
    return `/chat/${convo.partnerId}`;
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
            Chat dengan teman dan pacar sewaanmu
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Search Results Count */}
        {searchQuery && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-3"
          >
            {filteredConversations.length} hasil ditemukan
          </motion.p>
        )}

        {/* Conversations */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery ? "Tidak ada hasil" : "Belum ada pesan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Coba kata kunci lain" : "Mulai chat dengan teman-temanmu!"}
              </p>
            </div>
          ) : (
            filteredConversations.map((convo, index) => (
              <motion.div
                key={convo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <button
                  onClick={() => checkBookingBeforeOpen(convo.partnerId)}
                  className="w-full text-left block glass-card rounded-2xl p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-pink p-0.5">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {convo.avatar ? (
                            <img 
                              src={convo.avatar} 
                              alt={convo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {convo.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-mint rounded-full border-2 border-background" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {convo.name}
                          </h3>
                          {convo.type === "companion" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Talent
                            </Badge>
                          )}
                          {'hasBooking' in convo && convo.hasBooking && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                              📅 Dari Booking
                            </Badge>
                          )}
                        </div>
                        {convo.lastMessageTime && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(convo.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          convo.unreadCount > 0 
                            ? "text-foreground font-medium" 
                            : "text-muted-foreground"
                        }`}>
                          {convo.lastMessage 
                            ? <>{'isSentByMe' in convo && convo.isSentByMe && "Kamu: "}{convo.lastMessage}</>
                            : convo.type === "companion" 
                              ? `Chat dengan ${convo.name}`
                              : "Belum ada pesan"
                          }
                        </p>
                        {convo.unreadCount > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                            {convo.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {convo.city && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {convo.city}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, User, Sparkles, Wifi, WifiOff, Loader2, Lock, Trash2, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function Chat() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    messages, 
    loading, 
    isConnected,
    partnerOnlineStatus,
    typingStatus,
    sendMessage, 
    markAsRead,
    deleteMessage,
    sendTypingIndicator,
  } = useMessages(partnerId);
  
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(true); // Default locked until booking verified
  const [lockMessage, setLockMessage] = useState<string>("Memeriksa status booking...");
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [activeCountdown, setActiveCountdown] = useState<string>("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteForAll, setDeleteForAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch partner profile
    if (partnerId) {
      supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", partnerId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPartner(data as Profile);
        });

      // Check booking status to determine if chat should be locked
      checkBookingStatus(partnerId);
    }
  }, [user, partnerId, navigate]);

  // Check booking status for chat locking
  const checkBookingStatus = useCallback(async (companionId: string) => {
    if (!user || !companionId) {
      setIsChatLocked(true);
      setLockMessage("Silakan login terlebih dahulu");
      setIsReadOnly(false);
      return;
    }

    try {
      // Check for valid bookings between current user and partner
      const { data: bookings, error } = await (supabase as any)
        .from("bookings")
        .select("id, status, booking_date, booking_time, duration_hours, created_at, payment_id, companion_id, user_id")
        .or(`and(user_id.eq.${user.id},companion_id.eq.${companionId}),and(user_id.eq.${companionId},companion_id.eq.${user.id})`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setIsChatLocked(true);
        setLockMessage("Gagal memeriksa status booking. Silakan coba lagi.");
        setIsReadOnly(false);
        return;
      }

      if (!bookings || bookings.length === 0) {
        // No booking found - chat is locked
        setIsChatLocked(true);
        setLockMessage("Chat akan aktif setelah booking dan pembayaran dikonfirmasi.");
        setIsReadOnly(false);
        return;
      }

      const latestBooking = bookings[0];

      if (latestBooking.status === "cancelled") {
        setIsChatLocked(true);
        setIsReadOnly(false);
        setLockMessage("Booking telah dibatalkan. Chat ditutup.");
        return;
      }
      if (latestBooking.status === "completed") {
        setIsChatLocked(false);
        setIsReadOnly(true);
        setLockMessage("Sesi chat telah berakhir.");
        return;
      }

      const isPaidOrConfirmed =
        latestBooking.status === "confirmed" ||
        latestBooking.status === "approved" ||
        latestBooking.payment_id !== null;

      if (!isPaidOrConfirmed) {
        setIsChatLocked(true);
        setIsReadOnly(false);
        setLockMessage("Booking belum dikonfirmasi. Harap selesaikan pembayaran terlebih dahulu.");
        return;
      }

      const [hh = "00", mm = "00"] = (latestBooking.booking_time || "00:00").split(":");
      const startDate = new Date(latestBooking.booking_date);
      startDate.setHours(Number(hh), Number(mm), 0, 0);
      const endDate = new Date(startDate.getTime() + (Number(latestBooking.duration_hours) || 0) * 3600 * 1000);
      const now = new Date();

      if (now < startDate) {
        setIsChatLocked(true);
        setIsReadOnly(false);
        setLockMessage("Chat akan aktif saat waktu booking dimulai.");
        return;
      }
      if (now > endDate) {
        setIsChatLocked(false);
        setIsReadOnly(true);
        setLockMessage("Sesi chat telah berakhir.");
        return;
      }

      const remainingMs = endDate.getTime() - now.getTime();
      const hours = Math.floor(remainingMs / 3600000);
      const minutes = Math.floor((remainingMs % 3600000) / 60000);
      setActiveCountdown(`${hours}j ${minutes}m`);

      setIsChatLocked(false);
      setIsReadOnly(false);
      setLockMessage("");
    } catch (error) {
      console.error("Error in checkBookingStatus:", error);
      setIsChatLocked(true);
      setLockMessage("Terjadi kesalahan. Silakan coba lagi.");
      setIsReadOnly(false);
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Use setTimeout to ensure DOM is updated
      scrollTimeoutRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadIds = messages
        .filter(m => m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [messages, user, markAsRead]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !partnerId || sending || isChatLocked || isReadOnly) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
    sendTypingIndicator(false);

    setSending(true);
    const { error } = await sendMessage(message.trim(), partnerId);
    if (!error) {
      setMessage("");
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
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

  // Get message status icon
  const getMessageStatus = (msg: typeof messages[0]) => {
    if (msg.sender_id !== user?.id) return null;
    
    // Don't show status for deleted messages
    if (msg.is_deleted || msg.deleted_for_all) return null;
    
    if (msg.is_read) {
      return "✓✓"; // Read (blue double check)
    } else {
      return "✓"; // Sent (single check)
    }
  };

  // Handle message long press / right click
  const handleMessageAction = (messageId: string, deleteForAllOption: boolean) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    // Only allow deleting own messages
    if (msg.sender_id !== user?.id) return;

    // Don't allow deleting system messages
    if (msg.content?.includes("Chat ini dibuat karena pemesanan")) {
      toast.error("Pesan sistem tidak dapat dihapus");
      return;
    }

    // Don't allow deleting already deleted messages
    if (msg.deleted_for_all) {
      toast.error("Pesan sudah dihapus");
      return;
    }

    setSelectedMessageId(messageId);
    setDeleteForAll(deleteForAllOption);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedMessageId || deleting) return;

    setDeleting(true);
    const { error } = await deleteMessage(selectedMessageId, deleteForAll);
    
    if (error) {
      toast.error(error.message || "Gagal menghapus pesan");
    } else {
      toast.success(deleteForAll ? "Pesan dihapus untuk semua" : "Pesan dihapus untuk Anda");
    }

    setDeleting(false);
    setShowDeleteDialog(false);
    setSelectedMessageId(null);
  };

  // Check if message is deleted for current user
  const isMessageDeletedForMe = (msg: typeof messages[0]) => {
    if (!user) return false;
    if (msg.deleted_for_all) return true;
    if (msg.is_deleted && msg.sender_id === user.id) return true;
    return false;
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
              {partnerOnlineStatus && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            
              <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-foreground truncate">
                {partner?.full_name || "Loading..."}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {partnerOnlineStatus ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : (
                    "Offline"
                  )}
                </p>
                {!isChatLocked && !isReadOnly && activeCountdown && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-mint/15 text-mint border border-mint/30">
                    Chat Aktif · Sisa {activeCountdown}
                  </span>
                )}
                {isReadOnly && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                    Read Only
                  </span>
                )}
                {!isConnected && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    Menghubungkan...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Connection Status Banner */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-0 right-0 z-40 bg-destructive/10 border-b border-destructive/20 px-4 py-2"
          >
            <div className="flex items-center gap-2 text-sm text-destructive">
              <WifiOff className="w-4 h-4" />
              <span>Koneksi terputus. Mencoba menghubungkan ulang...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <main className={`flex-1 overflow-y-auto pt-14 pb-20 px-4 ${!isConnected ? 'pt-20' : ''}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {isChatLocked ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Chat Belum Tersedia
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  {lockMessage}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-lavender/20 flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-2">Belum ada pesan</p>
                <p className="text-sm text-muted-foreground">
                  Mulai percakapan dengan {partner?.full_name}!
                </p>
              </>
            )}
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
                  const showAvatar = !isOwn && (
                    index === 0 || 
                    msgs[index - 1].sender_id !== msg.sender_id
                  );
                  const isDeleted = isMessageDeletedForMe(msg);
                  const canDelete = isOwn && !msg.deleted_for_all && !msg.content?.includes("Chat ini dibuat karena pemesanan");
                  
                  return (
                    <ContextMenu key={msg.id}>
                      <ContextMenuTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 gap-2`}
                          onContextMenu={(e) => {
                            if (canDelete) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {!isOwn && showAvatar && (
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                              {partner?.avatar_url ? (
                                <img 
                                  src={partner.avatar_url} 
                                  alt={partner.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          )}
                          {!isOwn && !showAvatar && <div className="w-8 shrink-0" />}
                          
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl transition-all ${
                              isDeleted
                                ? "bg-muted/30 opacity-60"
                                : isOwn
                                ? "bg-gradient-to-r from-lavender to-pink text-white rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            } ${canDelete ? "cursor-pointer hover:opacity-90" : ""}`}
                          >
                            <p className={`text-sm whitespace-pre-wrap break-words ${
                              isDeleted ? "italic text-muted-foreground" : ""
                            }`}>
                              {isDeleted ? "Pesan ini telah dihapus" : msg.content}
                            </p>
                            <div className={`flex items-center gap-2 mt-1 ${
                              isOwn && !isDeleted ? "text-white/70" : "text-muted-foreground"
                            }`}>
                              <p className="text-[10px]">
                                {formatTime(msg.created_at)}
                              </p>
                              {isOwn && !isDeleted && (
                                <span className="text-[10px]">
                                  {getMessageStatus(msg)}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </ContextMenuTrigger>
                      {canDelete && (
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => handleMessageAction(msg.id, false)}
                            className="cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus untuk Saya
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleMessageAction(msg.id, true)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus untuk Semua
                          </ContextMenuItem>
                        </ContextMenuContent>
                      )}
                    </ContextMenu>
                  );
                })}
              </div>
            ))}
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {typingStatus && typingStatus.isTyping && typingStatus.userId === partnerId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start mb-2"
                >
                  <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4">
        {isChatLocked ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Chat Terkunci 🔒
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lockMessage}
                </p>
              </div>
            </div>
            {!lockMessage.includes("selesai") && !lockMessage.includes("dibatalkan") && partner && (
              <Button
                onClick={() => navigate(`/companion/${partnerId}`)}
                variant="gradient"
                className="w-full rounded-2xl h-12 shadow-lg shadow-primary/20"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Booking Sekarang
              </Button>
            )}
          </div>
        ) : isReadOnly ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Sesi chat telah berakhir
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anda masih dapat membaca pesan, namun input dinonaktifkan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <Input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-2xl h-12 bg-muted/50"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!isConnected || sending || isChatLocked || isReadOnly}
              />
              <Button
                variant="gradient"
                size="icon"
                className="h-12 w-12 rounded-2xl shrink-0"
                onClick={handleSend}
                disabled={!message.trim() || sending || !isConnected || isChatLocked || isReadOnly}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            {!isConnected && (
              <p className="text-xs text-destructive mt-2 text-center">
                Tidak dapat mengirim pesan saat koneksi terputus
              </p>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteForAll ? "Hapus untuk Semua" : "Hapus untuk Saya"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteForAll
                ? "Pesan akan dihapus untuk Anda dan penerima. Tindakan ini tidak dapat dibatalkan."
                : "Pesan akan dihapus dari chat Anda, tetapi tetap terlihat oleh penerima."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

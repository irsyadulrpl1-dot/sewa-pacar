import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "./useProfile";
import { toast } from "sonner";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  is_deleted?: boolean;
  deleted_for_all?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Conversation {
  partnerId: string;
  partner: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
  hasBooking?: boolean;
}

interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

export function useMessages(partnerId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null);
  const [partnerOnlineStatus, setPartnerOnlineStatus] = useState<boolean>(false);
  
  // Refs untuk mencegah duplikasi dan mengelola subscription
  const channelRef = useRef<any>(null);
  // Unique per-hook instance id (prevents channel name collisions across components)
  const instanceIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : `inst-${Math.random().toString(16).slice(2)}`
  );
  const messagesRef = useRef<Message[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Update messages ref whenever messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching conversations:", messagesError);
        setConversations([]);
        setLoading(false);
        return;
      }

      if (messagesData && messagesData.length > 0) {
        // Group by conversation partner
        const partnerMap = new Map<string, { messages: Message[]; unreadCount: number }>();
        
        messagesData.forEach(msg => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const existing = partnerMap.get(partnerId);
          
          if (existing) {
            existing.messages.push(msg as Message);
            if (msg.receiver_id === user.id && !msg.is_read) {
              existing.unreadCount++;
            }
          } else {
            partnerMap.set(partnerId, {
              messages: [msg as Message],
              unreadCount: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
            });
          }
        });

        // Fetch partner profiles
        const partnerIds = Array.from(partnerMap.keys());
        if (partnerIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("public_profiles")
            .select("*")
            .in("user_id", partnerIds);

          if (profilesError) {
            console.error("Error fetching partner profiles:", profilesError);
          }

          // Check if any conversation has a system message indicating it's from booking
          const convos: Conversation[] = Array.from(partnerMap.entries()).map(([partnerId, data]) => {
            // Check if first message is a system message about booking
            const firstMessage = data.messages[0];
            const hasBooking = firstMessage?.content?.includes("Chat ini dibuat karena pemesanan telah dikonfirmasi") || false;
            
            return {
              partnerId,
              partner: profiles?.find(p => p.user_id === partnerId) as Profile || null,
              lastMessage: firstMessage,
              unreadCount: data.unreadCount,
              hasBooking,
            };
          });

          // Sort conversations by last message time (most recent first)
          convos.sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
          });

          setConversations(convos);
        } else {
          setConversations([]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error in fetchConversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !partnerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(partnerId)) {
        console.error("Invalid partner ID format:", partnerId);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } else if (data) {
        // Remove duplicates
        const uniqueMessages = Array.from(
          new Map(data.map((msg: any) => [msg.id, msg as Message])).values()
        );
        setMessages(uniqueMessages);
        messagesRef.current = uniqueMessages;
      } else {
        setMessages([]);
        messagesRef.current = [];
      }
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user, partnerId]);

  // Fetch partner online status
  const fetchPartnerStatus = useCallback(async (partnerId: string) => {
    if (!partnerId) return;

    try {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("is_online, last_seen")
        .eq("user_id", partnerId)
        .maybeSingle();

      if (!error && data) {
        setPartnerOnlineStatus(data.is_online || false);
      }
    } catch (error) {
      console.error("Error fetching partner status:", error);
    }
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) {
      return;
    }

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const setupSubscription = () => {
      // Ensure we don't keep an old channel around when retrying
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = partnerId 
        ? `messages-${user.id}-${partnerId}-${instanceIdRef.current}` 
        : `messages-list-${user.id}-${instanceIdRef.current}`;
      
      const channel = supabase
        .channel(channelName, {
          config: {
            presence: {
              key: user.id,
            },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: partnerId 
              ? `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
              : `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            
            console.log("Real-time INSERT detected:", {
              messageId: newMsg.id,
              senderId: newMsg.sender_id,
              receiverId: newMsg.receiver_id,
              currentUserId: user.id,
              partnerId,
            });

            if (partnerId) {
              // Add message to current conversation
              setMessages(prev => {
                // Remove any temporary messages
                const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
                
                // Check if message already exists
                const exists = withoutTemp.some(m => m.id === newMsg.id);
                if (exists) {
                  console.log("Message already exists, skipping:", newMsg.id);
                  return prev;
                }

                // Add new message and sort by timestamp
                const updated = [...withoutTemp, newMsg].sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                messagesRef.current = updated;
                console.log("Added message via real-time:", newMsg.id);
                return updated;
              });
            } else {
              // Refresh conversations list
              fetchConversations();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: partnerId 
              ? `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
              : `receiver_id.eq.${user.id}`,
          },
          (payload) => {
            const updatedMsg = payload.new as Message;
            
            if (partnerId) {
              // Update message (read status or delete status)
              setMessages(prev => {
                const updated = prev.map(msg => {
                  if (msg.id === updatedMsg.id) {
                    // If deleted for all, update content
                    if (updatedMsg.deleted_for_all) {
                      return {
                        ...updatedMsg,
                        content: "Pesan ini telah dihapus",
                      };
                    }
                    return updatedMsg;
                  }
                  return msg;
                });
                messagesRef.current = updated;
                return updated;
              });
            } else {
              // Refresh conversations list
              fetchConversations();
            }
          }
        )
        .on("presence", { event: "sync" }, () => {
          setIsConnected(true);
          retryCountRef.current = 0;
        })
        .on("presence", { event: "join" }, ({ key, currentPresences }) => {
          // Handle user joining (for typing indicators)
          if (key !== user.id && partnerId && key === partnerId) {
            // Partner is online
            setPartnerOnlineStatus(true);
          }
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          // Handle user leaving
          if (key !== user.id && partnerId && key === partnerId) {
            // Partner went offline
            setPartnerOnlineStatus(false);
          }
        })
        .subscribe((status, err) => {
          console.log("Real-time subscription status:", status, err);
          
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            retryCountRef.current = 0;
            console.log("✅ Successfully subscribed to real-time channel:", channelName);
            
            // Track presence
            channel.track({
              online_at: new Date().toISOString(),
            });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            console.error("❌ Real-time subscription error:", status, err);
            setIsConnected(false);
            
            // Retry connection
            if (retryCountRef.current < 5) {
              retryCountRef.current++;
              const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
              console.log(`🔄 Retrying subscription in ${retryDelay}ms (attempt ${retryCountRef.current})`);
              retryTimeoutRef.current = setTimeout(() => {
                setupSubscription();
              }, retryDelay);
            } else {
              console.error("❌ Max retry attempts reached");
              toast.error("Koneksi terputus. Silakan refresh halaman.");
            }
          }
        });

      channelRef.current = channel;
    };

    setupSubscription();

    // Fetch initial data
    if (partnerId) {
      fetchMessages();
      fetchPartnerStatus(partnerId);
    } else {
      fetchConversations();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [user, partnerId, fetchMessages, fetchConversations, fetchPartnerStatus]);

  const validateChatAccess = async (receiverId: string) => {
    if (!user) {
      return { allowed: false, status: "nonaktif", message: "Silakan login terlebih dahulu" };
    }
    try {
      const { data: bookings, error } = await (supabase as any)
        .from("bookings")
        .select("id, status, booking_date, booking_time, duration_hours, payment_id, companion_id, user_id, created_at")
        .or(`and(user_id.eq.${user.id},companion_id.eq.${receiverId}),and(user_id.eq.${receiverId},companion_id.eq.${user.id})`)
        .order("created_at", { ascending: false });

      if (error) {
        return { allowed: false, status: "nonaktif", message: "Gagal memeriksa status booking. Silakan coba lagi." };
      }

      if (!bookings || bookings.length === 0) {
        return { allowed: false, status: "nonaktif", message: "Chat akan aktif setelah booking dan pembayaran dikonfirmasi." };
      }

      const latest = bookings[0];

      if (latest.status === "cancelled") {
        return { allowed: false, status: "nonaktif", message: "Booking telah dibatalkan. Chat ditutup." };
      }
      if (latest.status === "completed") {
        return { allowed: false, status: "read_only", message: "Sesi chat telah berakhir." };
      }

      const isPaidOrConfirmed = latest.status === "confirmed" || latest.status === "approved" || latest.payment_id !== null;

      if (!isPaidOrConfirmed) {
        return { allowed: false, status: "nonaktif", message: "Booking belum dikonfirmasi. Harap selesaikan pembayaran terlebih dahulu." };
      }

      const [hh = "00", mm = "00"] = (latest.booking_time || "00:00").split(":");
      const startDate = new Date(latest.booking_date);
      startDate.setHours(Number(hh), Number(mm), 0, 0);
      const endDate = new Date(startDate.getTime() + (Number(latest.duration_hours) || 0) * 3600 * 1000);
      const now = new Date();

      if (now < startDate) {
        return { allowed: false, status: "nonaktif", message: "Chat akan aktif saat waktu booking dimulai." };
      }
      if (now > endDate) {
        return { allowed: false, status: "read_only", message: "Sesi chat telah berakhir." };
      }

      return { allowed: true, status: "aktif", message: "" };
    } catch {
      return { allowed: false, status: "nonaktif", message: "Terjadi kesalahan. Silakan coba lagi." };
    }
  };

  const sendMessage = async (content: string, receiverId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Validate input
    if (!content || !content.trim()) {
      return { error: new Error("Pesan tidak boleh kosong") };
    }

    if (!receiverId) {
      return { error: new Error("ID penerima tidak valid") };
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receiverId)) {
      return { error: new Error("ID penerima tidak valid") };
    }

    // Prevent sending message to self
    if (user.id === receiverId) {
      return { error: new Error("Tidak dapat mengirim pesan ke diri sendiri") };
    }

    try {
      const access = await validateChatAccess(receiverId);
      if (!access.allowed) {
        toast.error(access.message || "Akses chat ditolak");
        return { error: new Error("403 Forbidden") };
      }

      // Create temporary message ID for optimistic update
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempMessage: Message = {
        id: tempId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Optimistic update immediately - add temporary message
      if (partnerId && partnerId === receiverId) {
        setMessages(prev => {
          const updated = [...prev, tempMessage];
          messagesRef.current = updated;
          return updated;
        });
      }

      // Insert message to database
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        
        // Remove temporary message on error
        if (partnerId && partnerId === receiverId) {
          setMessages(prev => {
            const updated = prev.filter(m => m.id !== tempId);
            messagesRef.current = updated;
            return updated;
          });
        }
        
        return { error };
      }

      // Replace temporary message with real message
      if (partnerId && partnerId === receiverId && data) {
        setMessages(prev => {
          // Remove temp message and add real one
          const withoutTemp = prev.filter(m => m.id !== tempId);
          const exists = withoutTemp.some(m => m.id === data.id);
          if (exists) {
            // If real message already exists (from real-time), just remove temp
            return withoutTemp;
          }
          const updated = [...withoutTemp, data as Message].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          messagesRef.current = updated;
          return updated;
        });
      }

      return { error: null, data };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      
      // Remove temporary message on error
      if (partnerId && partnerId === receiverId) {
        setMessages(prev => {
          const updated = prev.filter(m => !m.id.startsWith('temp-'));
          messagesRef.current = updated;
          return updated;
        });
      }
      
      return { error: error as Error };
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds)
        .eq("receiver_id", user.id);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const deleteMessage = async (messageId: string, deleteForAll: boolean = false) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // First, verify the message exists and belongs to the user
      const { data: message, error: fetchError } = await supabase
        .from("messages")
        .select("sender_id, is_deleted, deleted_for_all")
        .eq("id", messageId)
        .single();

      if (fetchError || !message) {
        return { error: new Error("Pesan tidak ditemukan") };
      }

      // Check if user is the sender
      if (message.sender_id !== user.id) {
        return { error: new Error("Anda hanya bisa menghapus pesan yang Anda kirim") };
      }

      // Check if message is already deleted
      if (message.deleted_for_all) {
        return { error: new Error("Pesan sudah dihapus") };
      }

      // Check if it's a system message (contains specific keywords)
      const { data: messageContent } = await supabase
        .from("messages")
        .select("content")
        .eq("id", messageId)
        .single();

      if (messageContent?.content?.includes("Chat ini dibuat karena pemesanan")) {
        return { error: new Error("Pesan sistem tidak dapat dihapus") };
      }

      // Perform soft delete
      const updateData: any = {
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      };

      if (deleteForAll) {
        updateData.deleted_for_all = true;
        updateData.is_deleted = true;
      } else {
        updateData.is_deleted = true;
      }

      const { error: updateError } = await supabase
        .from("messages")
        .update(updateData)
        .eq("id", messageId)
        .eq("sender_id", user.id); // Double check ownership

      if (updateError) {
        console.error("Error deleting message:", updateError);
        return { error: updateError };
      }

      // Optimistic update for real-time
      if (partnerId) {
        setMessages(prev => 
          prev.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                is_deleted: true,
                deleted_for_all: deleteForAll,
                deleted_at: updateData.deleted_at,
                deleted_by: user.id,
                content: deleteForAll ? "Pesan ini telah dihapus" : msg.content,
              };
            }
            return msg;
          })
        );
      } else {
        // Refresh conversations list
        fetchConversations();
      }

      return { error: null };
    } catch (error) {
      console.error("Error in deleteMessage:", error);
      return { error: error as Error };
    }
  };

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!user || !partnerId || !channelRef.current) return;

    try {
      // Send typing indicator via broadcast
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          typing: isTyping,
          userId: user.id,
          partnerId: partnerId,
        },
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }, [user, partnerId]);

  return {
    messages,
    conversations,
    loading,
    isConnected,
    typingStatus,
    partnerOnlineStatus,
    sendMessage,
    markAsRead,
    deleteMessage,
    sendTypingIndicator,
    refetch: partnerId ? fetchMessages : fetchConversations,
  };
}

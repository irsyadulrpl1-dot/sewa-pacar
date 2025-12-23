import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "./useProfile";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partner: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export function useMessages(partnerId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (messagesData) {
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
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", partnerIds);

        const convos: Conversation[] = Array.from(partnerMap.entries()).map(([partnerId, data]) => ({
          partnerId,
          partner: profiles?.find(p => p.user_id === partnerId) as Profile || null,
          lastMessage: data.messages[0],
          unreadCount: data.unreadCount,
        }));

        setConversations(convos);
      }
    }
    setLoading(false);
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !partnerId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, [user, partnerId]);

  useEffect(() => {
    if (user) {
      if (partnerId) {
        fetchMessages();
      } else {
        fetchConversations();
      }

      // Subscribe to realtime messages
      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (partnerId) {
              if (
                (newMsg.sender_id === user.id && newMsg.receiver_id === partnerId) ||
                (newMsg.sender_id === partnerId && newMsg.receiver_id === user.id)
              ) {
                setMessages(prev => [...prev, newMsg]);
              }
            } else {
              fetchConversations();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, partnerId, fetchMessages, fetchConversations]);

  const sendMessage = async (content: string, receiverId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      });

    return { error };
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", messageIds)
      .eq("receiver_id", user.id);
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    markAsRead,
    refetch: partnerId ? fetchMessages : fetchConversations,
  };
}

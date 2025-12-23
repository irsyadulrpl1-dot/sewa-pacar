import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Safe profile type without sensitive data (email, date_of_birth excluded)
export interface SafeFriendProfile {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  is_online: boolean | null;
  is_verified: boolean | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  last_seen: string | null;
  created_at: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: SafeFriendProfile;
  receiver?: SafeFriendProfile;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: SafeFriendProfile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    // Fetch friends where current user is either user_id or friend_id
    const { data: friendsData } = await supabase
      .from("friends")
      .select("*")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendsData) {
      // Fetch friend profiles using secure function (excludes email)
      const friendIds = friendsData.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );
      
      if (friendIds.length > 0) {
        // Use the secure get_friend_profile function for each friend
        const profilePromises = friendIds.map(friendId =>
          supabase.rpc("get_friend_profile", { friend_user_id: friendId })
        );
        
        const profileResults = await Promise.all(profilePromises);
        const profiles = profileResults
          .filter(result => result.data && result.data.length > 0)
          .map(result => result.data![0] as SafeFriendProfile);

        const friendsWithProfiles = friendsData.map(f => ({
          ...f,
          friend: profiles.find(p => 
            p.user_id === (f.user_id === user.id ? f.friend_id : f.user_id)
          )
        }));
        
        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    // Fetch sent requests
    const { data: sent } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", user.id)
      .eq("status", "pending");

    if (sent) {
      const receiverIds = sent.map(r => r.receiver_id);
      if (receiverIds.length > 0) {
        // Use the secure get_friend_profile function (excludes email)
        const profilePromises = receiverIds.map(receiverId =>
          supabase.rpc("get_friend_profile", { friend_user_id: receiverId })
        );
        
        const profileResults = await Promise.all(profilePromises);
        const profiles = profileResults
          .filter(result => result.data && result.data.length > 0)
          .map(result => result.data![0] as SafeFriendProfile);
        
        setSentRequests(sent.map(r => ({
          ...r,
          status: r.status as "pending" | "accepted" | "rejected",
          receiver: profiles.find(p => p.user_id === r.receiver_id)
        })));
      } else {
        setSentRequests([]);
      }
    }

    // Fetch received requests
    const { data: received } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (received) {
      const senderIds = received.map(r => r.sender_id);
      if (senderIds.length > 0) {
        // Use the secure get_friend_profile function (excludes email)
        const profilePromises = senderIds.map(senderId =>
          supabase.rpc("get_friend_profile", { friend_user_id: senderId })
        );
        
        const profileResults = await Promise.all(profilePromises);
        const profiles = profileResults
          .filter(result => result.data && result.data.length > 0)
          .map(result => result.data![0] as SafeFriendProfile);
        
        setReceivedRequests(received.map(r => ({
          ...r,
          status: r.status as "pending" | "accepted" | "rejected",
          sender: profiles.find(p => p.user_id === r.sender_id)
        })));
      } else {
        setReceivedRequests([]);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();

      // Subscribe to realtime updates
      const channel = supabase
        .channel("friend-requests")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "friend_requests",
          },
          () => {
            fetchRequests();
            fetchFriends();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setFriends([]);
      setSentRequests([]);
      setReceivedRequests([]);
      setLoading(false);
    }
  }, [user, fetchFriends, fetchRequests]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
      });

    if (!error) {
      await fetchRequests();
    }

    return { error };
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Update request status
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) return { error: updateError };

    // Create friendship (both directions)
    const { error: friendError } = await supabase
      .from("friends")
      .insert([
        { user_id: user.id, friend_id: senderId },
        { user_id: senderId, friend_id: user.id },
      ]);

    if (!friendError) {
      await fetchFriends();
      await fetchRequests();
    }

    return { error: friendError };
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (!error) {
      await fetchRequests();
    }

    return { error };
  };

  const cancelFriendRequest = async (requestId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId);

    if (!error) {
      await fetchRequests();
    }

    return { error };
  };

  const removeFriend = async (friendUserId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Remove both directions
    const { error } = await supabase
      .from("friends")
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${user.id})`);

    if (!error) {
      await fetchFriends();
    }

    return { error };
  };

  const getFriendStatus = (userId: string): "none" | "friends" | "request_sent" | "request_received" => {
    if (friends.some(f => f.friend?.user_id === userId)) {
      return "friends";
    }
    if (sentRequests.some(r => r.receiver_id === userId)) {
      return "request_sent";
    }
    if (receivedRequests.some(r => r.sender_id === userId)) {
      return "request_received";
    }
    return "none";
  };

  const getRequestByUser = (userId: string) => {
    return sentRequests.find(r => r.receiver_id === userId) || 
           receivedRequests.find(r => r.sender_id === userId);
  };

  return {
    friends,
    sentRequests,
    receivedRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendStatus,
    getRequestByUser,
    refetch: () => {
      fetchFriends();
      fetchRequests();
    },
  };
}

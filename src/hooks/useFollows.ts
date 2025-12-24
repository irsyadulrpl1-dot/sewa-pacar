import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFollows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get list of users the current user is following
  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) throw error;
      return data.map(f => f.following_id);
    },
    enabled: !!user,
  });

  // Get list of users following the current user
  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", user.id);

      if (error) throw error;
      return data.map(f => f.follower_id);
    },
    enabled: !!user,
  });

  // Get following count for a specific user
  const useFollowingCount = (userId: string) => {
    return useQuery({
      queryKey: ["following-count", userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId);

        if (error) throw error;
        return count || 0;
      },
    });
  };

  // Get followers count for a specific user
  const useFollowersCount = (userId: string) => {
    return useQuery({
      queryKey: ["followers-count", userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId);

        if (error) throw error;
        return count || 0;
      },
    });
  };

  // Check if current user is following a specific user
  const isFollowing = (userId: string) => {
    return following?.includes(userId) ?? false;
  };

  // Follow a user
  const followUser = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Berhasil follow!");
    },
    onError: (error) => {
      toast.error("Gagal follow: " + error.message);
    },
  });

  // Unfollow a user
  const unfollowUser = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Berhasil unfollow!");
    },
    onError: (error) => {
      toast.error("Gagal unfollow: " + error.message);
    },
  });

  // Toggle follow status
  const toggleFollow = async (targetUserId: string) => {
    if (isFollowing(targetUserId)) {
      await unfollowUser.mutateAsync(targetUserId);
    } else {
      await followUser.mutateAsync(targetUserId);
    }
  };

  return {
    following,
    followers,
    isLoadingFollowing,
    isLoadingFollowers,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    useFollowingCount,
    useFollowersCount,
  };
}

// Separate hook for getting follow counts
export function useFollowCounts(userId: string) {
  const { data: followingCount, isLoading: isLoadingFollowingCount } = useQuery({
    queryKey: ["following-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  const { data: followersCount, isLoading: isLoadingFollowersCount } = useQuery({
    queryKey: ["followers-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  return {
    followingCount: followingCount ?? 0,
    followersCount: followersCount ?? 0,
    isLoading: isLoadingFollowingCount || isLoadingFollowersCount,
  };
}

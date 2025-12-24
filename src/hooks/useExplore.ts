import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type FilterType = "popular" | "latest" | "nearby" | "interests";

export interface ExplorePost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  tags: string[] | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  score: number;
  author_username: string;
  author_full_name: string;
  author_avatar_url: string | null;
  author_bio: string | null;
  author_city: string | null;
  author_is_verified: boolean | null;
  is_liked: boolean;
  is_saved: boolean;
}

export function useExplore() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("popular");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Get user profile for interests and city
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("interests, city")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch explore posts
  const {
    data: posts,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["explore-posts", filter, page, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc("get_explore_posts", {
        current_user_id: user.id,
        filter_type: filter,
        user_interests: userProfile?.interests || [],
        user_city: userProfile?.city || null,
        page_limit: pageSize,
        page_offset: page * pageSize,
      });

      if (error) {
        console.error("Explore fetch error:", error);
        throw error;
      }

      return (data || []) as ExplorePost[];
    },
    enabled: !!user,
  });

  // Record view
  const recordView = useCallback(async (postId: string) => {
    if (!user) return;
    
    try {
      await supabase.from("post_views").upsert(
        { post_id: postId, user_id: user.id },
        { onConflict: "post_id,user_id" }
      );
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Failed to record view:", error);
    }
  }, [user]);

  // Toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
    },
  });

  // Toggle save
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isSaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
        toast({ title: "Postingan disimpan!" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
    },
  });

  // Save search query
  const saveSearchQuery = useCallback(async (query: string) => {
    if (!user || !query.trim()) return;
    
    try {
      await supabase.from("search_history").insert({
        user_id: user.id,
        search_query: query.trim(),
      });
    } catch (error) {
      console.error("Failed to save search:", error);
    }
  }, [user]);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const changeFilter = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
  }, []);

  return {
    posts: posts || [],
    isLoading,
    isFetching,
    filter,
    changeFilter,
    loadMore,
    hasMore: (posts?.length || 0) === pageSize,
    recordView,
    toggleLike: (postId: string, isLiked: boolean) => 
      toggleLikeMutation.mutate({ postId, isLiked }),
    toggleSave: (postId: string, isSaved: boolean) => 
      toggleSaveMutation.mutate({ postId, isSaved }),
    saveSearchQuery,
    refetch,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  profile: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export function usePosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Feed posts - posts from users the current user follows + own posts
  const { data: feedPosts, isLoading: isLoadingFeed } = useQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get list of users the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;

      const followingIds = followingData.map(f => f.following_id);
      // Include own posts + posts from followed users
      const userIds = [user.id, ...followingIds];

      if (userIds.length === 0) return [];

      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          image_url,
          caption,
          created_at
        `)
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles, likes count, and comments count for each post
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          const [profileRes, likesRes, commentsRes, userLikeRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, username, avatar_url")
              .eq("user_id", post.user_id)
              .single(),
            supabase
              .from("post_likes")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            supabase
              .from("post_comments")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            supabase
              .from("post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          return {
            ...post,
            profile: profileRes.data || { full_name: "Unknown", username: "unknown", avatar_url: null },
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            is_liked: !!userLikeRes.data,
          };
        })
      );

      return postsWithDetails as Post[];
    },
    enabled: !!user,
  });

  // All posts (for explore/non-logged in users)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          image_url,
          caption,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles, likes count, and comments count for each post
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          const [profileRes, likesRes, commentsRes, userLikeRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, username, avatar_url")
              .eq("user_id", post.user_id)
              .single(),
            supabase
              .from("post_likes")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            supabase
              .from("post_comments")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            user
              ? supabase
                  .from("post_likes")
                  .select("id")
                  .eq("post_id", post.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : { data: null },
          ]);

          return {
            ...post,
            profile: profileRes.data || { full_name: "Unknown", username: "unknown", avatar_url: null },
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            is_liked: !!userLikeRes.data,
          };
        })
      );

      return postsWithDetails as Post[];
    },
  });

  const { data: userPosts, isLoading: isLoadingUserPosts } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async ({ imageFile, caption }: { imageFile: File; caption: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Upload image
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      // Create post
      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
        });

      if (postError) throw postError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Post berhasil dibuat!");
    },
    onError: (error) => {
      toast.error("Gagal membuat post: " + error.message);
    },
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Post berhasil dihapus!");
    },
  });

  return {
    posts,
    isLoading,
    feedPosts,
    isLoadingFeed,
    userPosts,
    isLoadingUserPosts,
    createPost,
    toggleLike,
    deletePost,
  };
}

export function usePostComments(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get profiles for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username, avatar_url")
            .eq("user_id", comment.user_id)
            .single();

          return {
            ...comment,
            profile: profile || { full_name: "Unknown", username: "unknown", avatar_url: null },
          };
        })
      );

      return commentsWithProfiles;
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { comments, isLoading, addComment };
}

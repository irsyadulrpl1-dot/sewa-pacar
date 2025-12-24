-- Create post_views table for tracking views
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create saved_posts table for save/bookmark functionality
CREATE TABLE public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create search_history table for tracking user searches
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tags/categories to posts
ALTER TABLE public.posts ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Post views policies
CREATE POLICY "Anyone can view post views count" ON public.post_views FOR SELECT USING (true);
CREATE POLICY "Users can record views" ON public.post_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved posts policies
CREATE POLICY "Users can view own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON public.search_history FOR DELETE USING (auth.uid() = user_id);

-- Create function to get explore posts with scoring
CREATE OR REPLACE FUNCTION public.get_explore_posts(
  current_user_id UUID,
  filter_type TEXT DEFAULT 'popular',
  user_interests TEXT[] DEFAULT '{}',
  user_city TEXT DEFAULT NULL,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  image_url TEXT,
  caption TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT,
  comment_count BIGINT,
  view_count BIGINT,
  score NUMERIC,
  author_username TEXT,
  author_full_name TEXT,
  author_avatar_url TEXT,
  author_bio TEXT,
  author_city TEXT,
  author_is_verified BOOLEAN,
  is_liked BOOLEAN,
  is_saved BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.image_url,
    p.caption,
    p.tags,
    p.created_at,
    COALESCE(likes.cnt, 0) AS like_count,
    COALESCE(comments.cnt, 0) AS comment_count,
    COALESCE(views.cnt, 0) AS view_count,
    -- Scoring algorithm: likes * 3 + comments * 5 + views * 1 + recency bonus
    (COALESCE(likes.cnt, 0) * 3 + COALESCE(comments.cnt, 0) * 5 + COALESCE(views.cnt, 0) * 1 +
      CASE 
        WHEN p.created_at > now() - interval '1 day' THEN 50
        WHEN p.created_at > now() - interval '7 days' THEN 20
        WHEN p.created_at > now() - interval '30 days' THEN 5
        ELSE 0
      END +
      -- Interest matching bonus
      CASE 
        WHEN user_interests IS NOT NULL AND array_length(user_interests, 1) > 0 
             AND p.tags IS NOT NULL AND array_length(p.tags, 1) > 0
             AND p.tags && user_interests THEN 30
        ELSE 0
      END +
      -- Location bonus
      CASE 
        WHEN user_city IS NOT NULL AND prof.city = user_city THEN 20
        ELSE 0
      END
    )::NUMERIC AS score,
    prof.username AS author_username,
    prof.full_name AS author_full_name,
    prof.avatar_url AS author_avatar_url,
    prof.bio AS author_bio,
    prof.city AS author_city,
    prof.is_verified AS author_is_verified,
    EXISTS(SELECT 1 FROM public.post_likes pl WHERE pl.post_id = p.id AND pl.user_id = current_user_id) AS is_liked,
    EXISTS(SELECT 1 FROM public.saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = current_user_id) AS is_saved
  FROM public.posts p
  INNER JOIN public.profiles prof ON p.user_id = prof.user_id
  LEFT JOIN (SELECT post_id, COUNT(*) AS cnt FROM public.post_likes GROUP BY post_id) likes ON p.id = likes.post_id
  LEFT JOIN (SELECT post_id, COUNT(*) AS cnt FROM public.post_comments GROUP BY post_id) comments ON p.id = comments.post_id
  LEFT JOIN (SELECT post_id, COUNT(*) AS cnt FROM public.post_views GROUP BY post_id) views ON p.id = views.post_id
  WHERE p.user_id != current_user_id
    -- Exclude posts from users already followed (friends)
    AND NOT EXISTS (
      SELECT 1 FROM public.friends f 
      WHERE (f.user_id = current_user_id AND f.friend_id = p.user_id)
         OR (f.friend_id = current_user_id AND f.user_id = p.user_id)
    )
  ORDER BY
    CASE filter_type
      WHEN 'latest' THEN EXTRACT(EPOCH FROM p.created_at)
      WHEN 'popular' THEN (COALESCE(likes.cnt, 0) * 3 + COALESCE(comments.cnt, 0) * 5 + COALESCE(views.cnt, 0))::NUMERIC
      WHEN 'nearby' THEN CASE WHEN prof.city = user_city THEN 1000000 ELSE 0 END
      ELSE (COALESCE(likes.cnt, 0) * 3 + COALESCE(comments.cnt, 0) * 5 + COALESCE(views.cnt, 0) * 1 +
        CASE WHEN p.created_at > now() - interval '1 day' THEN 50 WHEN p.created_at > now() - interval '7 days' THEN 20 ELSE 0 END)::NUMERIC
    END DESC,
    p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts;
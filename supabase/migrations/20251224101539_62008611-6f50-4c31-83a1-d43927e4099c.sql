-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view post views count" ON public.post_views;

-- Create a new policy that only allows post owners to see who viewed their posts
CREATE POLICY "Post owners can view their post views" ON public.post_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p 
      WHERE p.id = post_views.post_id 
      AND p.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );
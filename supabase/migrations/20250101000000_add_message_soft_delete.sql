-- Add soft delete columns to messages table
-- This allows messages to be deleted without hard deletion from database

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_for_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for_all ON public.messages(deleted_for_all);

-- Add comment for documentation
COMMENT ON COLUMN public.messages.is_deleted IS 'True if message is deleted for the sender';
COMMENT ON COLUMN public.messages.deleted_for_all IS 'True if message is deleted for both sender and receiver';
COMMENT ON COLUMN public.messages.deleted_at IS 'Timestamp when message was deleted';
COMMENT ON COLUMN public.messages.deleted_by IS 'User ID who deleted the message';

-- Update RLS policies to allow users to update their own sent messages
-- This is needed for soft delete functionality
DROP POLICY IF EXISTS "Users can update own sent messages" ON public.messages;
CREATE POLICY "Users can update own sent messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

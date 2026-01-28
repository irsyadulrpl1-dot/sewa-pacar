-- Fix storage policies for payment proofs to use split_part instead of foldername
-- This ensures the policies work correctly with the file path structure

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own payment proofs" ON storage.objects;

-- Recreate policies with split_part for better compatibility
-- File path format: {user_id}/{payment_id}-{timestamp}.{ext}
CREATE POLICY "Users can upload payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can view own payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update own payment proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete own payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = split_part(name, '/', 1)
);


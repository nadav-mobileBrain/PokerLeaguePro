-- Fix storage bucket policies to work with service role
-- Remove existing policies that depend on auth.uid()
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON storage.objects;

-- Create new policies that allow service role access
CREATE POLICY "Allow service role upload to avatars" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow service role update avatars" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow service role delete from avatars" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars');
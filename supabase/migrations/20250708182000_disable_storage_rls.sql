-- Instead of directly modifying storage.objects, use the storage admin functions

-- 1. Update the bucket to be public (this is safer than disabling RLS)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 2. Create a policy that allows anyone to read from the avatars bucket
CREATE POLICY "Public read access for avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Create a policy that allows authenticated users to upload to avatars
CREATE POLICY "Allow authenticated users to upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Note: These operations should be run with the service_role key or by a superuser
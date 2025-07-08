
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Set up Row Level Security (RLS)
-- Allow users to upload their own avatar
CREATE POLICY "Enable insert for authenticated users only" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner_id::text);

-- Allow users to update their own avatar
CREATE POLICY "Enable update for users based on user_id" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');

-- Allow public access to avatars
CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

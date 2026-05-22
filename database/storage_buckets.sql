-- =====================================================
-- Supabase Storage Buckets Setup
-- =====================================================
-- Run these commands in Supabase SQL Editor
-- Note: Storage buckets are created via Supabase Dashboard or API
-- This file provides the bucket names and policies

-- =====================================================
-- STORAGE BUCKETS TO CREATE
-- =====================================================
-- Create these buckets in Supabase Dashboard > Storage
-- Or use the Supabase Management API

-- 1. avatars - Profile pictures
--    - Public: Yes (for profile images)
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- 2. team-assets - Team logos
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- 3. tournament-assets - Tournament logos
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- 4. match-images - Match winning moments
--    - Public: Yes
--    - File size limit: 10MB per file
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- 5. venues - Venue images
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- =====================================================
-- STORAGE POLICIES (RLS for Storage)
-- =====================================================

-- Note: Storage policies are created in Supabase Dashboard > Storage > Policies
-- Or via SQL using storage.objects table

-- Example policies (adjust based on your needs):

-- AVATARS BUCKET POLICIES
-- 1. Users can upload their own avatar
-- 2. Anyone can view avatars (public read)
-- 3. Users can update/delete their own avatar

-- TEAM ASSETS BUCKET POLICIES
-- 1. Team owners can upload team logos
-- 2. Anyone can view team logos (public read)
-- 3. Team owners can update/delete their team logos

-- TOURNAMENT ASSETS BUCKET POLICIES
-- 1. Tournament creators can upload tournament logos
-- 2. Anyone can view tournament logos (public read)
-- 3. Tournament creators can update/delete their tournament logos

-- MATCH IMAGES BUCKET POLICIES
-- 1. Match admins can upload match images
-- 2. Anyone can view match images (public read)
-- 3. Match admins can update/delete match images

-- VENUES BUCKET POLICIES
-- 1. Admins can upload venue images
-- 2. Anyone can view venue images (public read)
-- 3. Admins can update/delete venue images

-- =====================================================
-- STORAGE POLICY SQL EXAMPLES
-- =====================================================

-- Example: Allow users to upload their own avatar
-- CREATE POLICY "Users can upload own avatar"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Example: Allow public read access to avatars
-- CREATE POLICY "Public avatar access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');

-- Example: Allow users to update their own avatar
-- CREATE POLICY "Users can update own avatar"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Create buckets via Supabase Dashboard: Storage > New Bucket
-- 2. Set appropriate file size limits
-- 3. Configure CORS if needed for web access
-- 4. Set up policies for each bucket based on your security requirements
-- 5. Consider using folder structure: user_id/filename.ext for avatars


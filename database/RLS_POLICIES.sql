-- =====================================================
-- Row Level Security (RLS) Policies for Cricket App
-- =====================================================
-- Run these commands AFTER creating tables and enabling RLS
-- Adjust policies based on your specific security requirements
-- 
-- NOTE: This file is safe to run multiple times.
-- Policies will be dropped and recreated if they already exist.
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- HELPER FUNCTION: Check if user is admin
-- =====================================================
-- Create a function to check admin status (adjust based on your admin system)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add your admin check logic here
  -- For example, check a user_profiles.is_admin column
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND email LIKE '%@admin.%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view all profiles (public read)
CREATE POLICY "Public profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- TEAMS POLICIES
-- =====================================================

-- Anyone can view teams
CREATE POLICY "Teams are viewable by everyone"
ON teams FOR SELECT
USING (true);

-- Team owners can update their teams
CREATE POLICY "Team owners can update own teams"
ON teams FOR UPDATE
USING (auth.uid() = owner_id);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
ON teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Team owners can delete their teams
CREATE POLICY "Team owners can delete own teams"
ON teams FOR DELETE
USING (auth.uid() = owner_id);

-- =====================================================
-- TEAM PLAYERS POLICIES
-- =====================================================

-- Anyone can view team players
CREATE POLICY "Team players are viewable by everyone"
ON team_players FOR SELECT
USING (true);

-- Team owners can insert team players (invitations)
CREATE POLICY "Team owners can invite players"
ON team_players FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_players.team_id AND owner_id = auth.uid()
  )
);

-- Players can update their own status (accept/decline)
CREATE POLICY "Players can update own status"
ON team_players FOR UPDATE
USING (auth.uid() = player_id);

-- Team owners can remove players
CREATE POLICY "Team owners can remove players"
ON team_players FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_players.team_id AND owner_id = auth.uid()
  )
);

-- =====================================================
-- TOURNAMENTS POLICIES
-- =====================================================

-- Anyone can view tournaments
CREATE POLICY "Tournaments are viewable by everyone"
ON tournaments FOR SELECT
USING (true);

-- Authenticated users can create tournaments
CREATE POLICY "Authenticated users can create tournaments"
ON tournaments FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Tournament creators can update their tournaments
CREATE POLICY "Tournament creators can update own tournaments"
ON tournaments FOR UPDATE
USING (auth.uid() = creator_id);

-- Tournament creators can delete their tournaments
CREATE POLICY "Tournament creators can delete own tournaments"
ON tournaments FOR DELETE
USING (auth.uid() = creator_id);

-- =====================================================
-- TOURNAMENT TEAMS POLICIES
-- =====================================================

-- Anyone can view tournament teams
CREATE POLICY "Tournament teams are viewable by everyone"
ON tournament_teams FOR SELECT
USING (true);

-- Tournament creators can invite teams
CREATE POLICY "Tournament creators can invite teams"
ON tournament_teams FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE id = tournament_teams.tournament_id AND creator_id = auth.uid()
  )
);

-- Team owners can update their invitation status
CREATE POLICY "Team owners can respond to invitations"
ON tournament_teams FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = tournament_teams.team_id AND owner_id = auth.uid()
  )
);

-- =====================================================
-- MATCHES POLICIES
-- =====================================================

-- Anyone can view matches
CREATE POLICY "Matches are viewable by everyone"
ON matches FOR SELECT
USING (true);

-- Tournament creators can create matches
CREATE POLICY "Tournament creators can create matches"
ON matches FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE id = matches.tournament_id AND creator_id = auth.uid()
  )
);

-- Tournament creators and match admins can update matches
CREATE POLICY "Tournament creators can update matches"
ON matches FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE id = matches.tournament_id AND creator_id = auth.uid()
  )
);

-- =====================================================
-- LIKES POLICIES
-- =====================================================

-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

-- Authenticated users can like
CREATE POLICY "Authenticated users can like"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete their own likes)
CREATE POLICY "Users can unlike"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Authenticated users can comment
CREATE POLICY "Authenticated users can comment"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can create notifications (via service role)
-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- ERROR REPORTS POLICIES
-- =====================================================

-- Users can view reports for matches they're involved in
CREATE POLICY "Users can view relevant error reports"
ON error_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = error_reports.match_id
    AND (
      m.team1_id IN (SELECT team_id FROM team_players WHERE player_id = auth.uid())
      OR m.team2_id IN (SELECT team_id FROM team_players WHERE player_id = auth.uid())
    )
  )
  OR auth.uid() = reported_by
);

-- Team members can report errors
CREATE POLICY "Team members can report errors"
ON error_reports FOR INSERT
WITH CHECK (auth.uid() = reported_by);

-- =====================================================
-- WALLETS POLICIES
-- =====================================================

-- Users can only view their own wallet
CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
USING (auth.uid() = user_id);

-- System can create wallets (via service role)
-- Users cannot directly update wallet balance (use transactions)

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- System can create transactions (via service role)
-- Users cannot directly insert transactions (use payment hooks)

-- =====================================================
-- WITHDRAW REQUESTS POLICIES
-- =====================================================

-- Users can view their own withdraw requests
CREATE POLICY "Users can view own withdraw requests"
ON withdraw_requests FOR SELECT
USING (auth.uid() = user_id);

-- Users can create withdraw requests
CREATE POLICY "Users can create withdraw requests"
ON withdraw_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update withdraw request status
CREATE POLICY "Admins can update withdraw requests"
ON withdraw_requests FOR UPDATE
USING (is_admin(auth.uid()));

-- =====================================================
-- TEAM POSTS POLICIES
-- =====================================================

-- Anyone can view team posts
CREATE POLICY "Team posts are viewable by everyone"
ON team_posts FOR SELECT
USING (true);

-- Team members can create posts
CREATE POLICY "Team members can create posts"
ON team_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_players
    WHERE team_id = team_posts.team_id
    AND player_id = auth.uid()
    AND status = 'accepted'
  )
);

-- Post authors can update their posts
CREATE POLICY "Post authors can update own posts"
ON team_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Post authors can delete their posts
CREATE POLICY "Post authors can delete own posts"
ON team_posts FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- VENUES POLICIES
-- =====================================================

-- Anyone can view venues
CREATE POLICY "Venues are viewable by everyone"
ON venues FOR SELECT
USING (true);

-- Admins can create/update venues
CREATE POLICY "Admins can manage venues"
ON venues FOR ALL
USING (is_admin(auth.uid()));

-- =====================================================
-- TEAM STATS POLICIES
-- =====================================================

-- Anyone can view team stats
CREATE POLICY "Team stats are viewable by everyone"
ON team_stats FOR SELECT
USING (true);

-- System can update team stats (via service role or triggers)

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Adjust policies based on your specific requirements
-- 2. Some operations (like wallet updates) should be done via service role
-- 3. Consider adding more granular permissions for team captains
-- 4. Add admin policies where needed
-- 5. Test all policies thoroughly before production


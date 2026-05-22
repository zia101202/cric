# Code Review Report - Comprehensive Error & Missing Items Check

## ✅ Fixed Issues

### 1. **PlayerRole Type Mismatch** - FIXED
- **Issue**: `userProfileStore.ts` used `'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper'` while `teamStore.ts` used `'batsman' | 'bowler' | 'allrounder' | 'keeper'`
- **Fix**: Updated `teamStore.ts` to match `userProfileStore.ts` format for consistency
- **Files**: `store/teamStore.ts`

### 2. **Missing Dependency in usePlayerStatsUpdate** - FIXED
- **Issue**: `updateTeamPlayerStats` was called before being defined in dependency array
- **Fix**: Moved function definition before `updatePlayerStatsFromMatch` and added to dependency array
- **Files**: `hooks/usePlayerStatsUpdate.ts`

### 3. **RPC Function Dependencies** - FIXED
- **Issue**: `useTeamPlayers.ts` used `supabase.rpc()` functions that may not exist
- **Fix**: Replaced with direct database updates as fallback
- **Files**: `hooks/useTeamPlayers.ts`

### 4. **Icon Component Usage** - FIXED
- **Issue**: Icon component used inside Text component (invalid nesting)
- **Fix**: Wrapped Icon and Text in View component
- **Files**: `ui/MatchCard.tsx`

### 5. **useTeamStats Hook** - FIXED
- **Issue**: Incorrect Map access and missing null checks
- **Fix**: Added proper null checks and fixed Map access pattern
- **Files**: `hooks/useTeamStats.ts`

## ⚠️ Remaining Issues & Missing Items

### 1. **Duplicate Tournament Hooks**
- **Issue**: Two similar hooks exist:
  - `hooks/useTournament.ts` - Uses `tournamentStore`
  - `hooks/useTournamentManagement.ts` - Uses `tournamentManagementStore`
- **Recommendation**: Consolidate or clearly document which to use for what purpose
- **Files**: `hooks/useTournament.ts`, `hooks/useTournamentManagement.ts`

### 2. **Missing Database Functions**
- **Issue**: Code references RPC functions that need to be created in Supabase:
  - `increment_team_total_players`
  - `decrement_team_accepted_players`
- **Status**: Already fixed with fallback, but RPC functions should be created for better performance
- **Files**: `hooks/useTeamPlayers.ts`

### 3. **Missing Database Tables**
The following tables are referenced but need to be created in Supabase:

#### Required Tables:
- `user_profiles` - User profile data
- `teams` - Team information
- `team_players` - Team membership
- `team_stats` - Team statistics
- `tournaments` - Tournament data
- `tournament_teams` - Tournament team invitations
- `matches` - Match data
- `likes` - Like data
- `comments` - Comment data
- `team_invitations` - Team invitation tracking
- `error_reports` - Score error reports
- `notifications` - User notifications
- `venues` - Venue information
- `score_reports` - Score verification reports

### 4. **Missing Storage Buckets**
Supabase Storage buckets need to be created:
- `avatars` - Profile pictures
- `team-assets` - Team logos
- `tournament-assets` - Tournament logos
- `match-images` - Match winning moments
- `venues` - Venue images

### 5. **Missing RLS Policies Documentation**
- **Issue**: No documentation file for Row Level Security policies
- **Recommendation**: Create `database/RLS_POLICIES.md` with all required policies

### 6. **Missing Error Handling**
- **Issue**: Some hooks don't handle all edge cases:
  - `useTeamStats.ts` - Division by zero in strength score calculation
  - `usePlayerStatsUpdate.ts` - Missing error handling for profile updates
- **Files**: Multiple hooks

### 7. **Missing Validation**
- **Issue**: Some inputs lack validation:
  - Team name length validation
  - Tournament entry fee validation (must be >= 0)
  - Player role validation
- **Files**: Various hooks

### 8. **Missing Type Exports**
- **Issue**: Some types are not exported from stores, making them hard to reuse
- **Recommendation**: Create `types/index.ts` for shared types

### 9. **Missing useMessages Hook**
- **Issue**: `store/messageStore.ts` exists but no `hooks/useMessages.ts`
- **Status**: Store created but hook implementation missing

### 10. **Missing useNotifications Hook**
- **Issue**: `store/notificationStore.ts` exists but no `hooks/useNotifications.ts`
- **Status**: Store created but hook implementation missing

### 11. **Missing useTeamSocial Hook**
- **Issue**: Team social features mentioned but hook not implemented
- **Status**: Store has team posts but no social hook

### 12. **Missing Screens**
Many screens are referenced but not created:
- Profile screens (using ProfilePictureUploader)
- Match scoring screens
- Tournament management screens
- Team management screens
- Chat/messaging screens
- Notification screens

### 13. **Missing Database Schema Documentation**
- **Issue**: No comprehensive schema documentation
- **Recommendation**: Create `database/SCHEMA.md` with all table structures

### 14. **Missing Environment Variable Handling**
- **Issue**: Supabase config uses hardcoded fallbacks
- **Recommendation**: Use `expo-constants` or `react-native-config` for proper env handling

### 15. **Missing Image Picker Permissions**
- **Issue**: Components use `expo-image-picker` but permissions not configured in `app.json`
- **Files**: `ui/ProfilePictureUploader.tsx`, `ui/WinningMomentUploader.tsx`

### 16. **Missing Realtime Subscriptions Cleanup**
- **Issue**: Some hooks create subscriptions but cleanup might not work correctly
- **Files**: `hooks/useLikes.ts`, `hooks/useComments.ts`

### 17. **Missing useMatchSchedule Hook**
- **Issue**: Tournament management needs match scheduling but hook not found
- **Status**: Referenced in requirements but not implemented

### 18. **Missing useScoreVerification Hook**
- **Issue**: Score verification logic mentioned but hook not found
- **Status**: Partially in `useMatchReporting.ts` but could be separate

### 19. **Icon Component Type Issues**
- **Issue**: React Native Paper Icon `source` prop expects specific format
- **Status**: Usage looks correct but may need verification at runtime

### 20. **Missing Error Boundaries**
- **Issue**: No error boundary components for graceful error handling
- **Recommendation**: Create `components/ErrorBoundary.tsx`

## 📋 Recommendations

### High Priority
1. Create database schema documentation
2. Create RLS policies documentation
3. Implement missing hooks (useMessages, useNotifications, useTeamSocial)
4. Add comprehensive error handling
5. Create missing screens

### Medium Priority
1. Consolidate duplicate tournament hooks
2. Add input validation utilities
3. Create shared types file
4. Add error boundaries
5. Document all Supabase functions needed

### Low Priority
1. Optimize RPC function usage
2. Add unit tests
3. Improve TypeScript strictness
4. Add JSDoc comments to all public functions

## ✅ What's Working Well

1. Clean architecture with proper separation of concerns
2. Consistent use of Zustand for state management
3. Good TypeScript typing throughout
4. Reusable UI components
5. Proper error handling in most hooks
6. Clean folder structure

## 🔧 Next Steps

1. Create database schema SQL files
2. Create RLS policies SQL files
3. Implement missing hooks
4. Create missing screens
5. Add comprehensive validation
6. Set up proper environment variable handling
7. Add error boundaries
8. Create integration tests


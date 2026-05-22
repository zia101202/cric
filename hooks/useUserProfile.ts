import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useUserProfileStore, UserProfile, PlayerRole } from '../store/userProfileStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for user profile operations
 * Handles fetching, updating, and uploading profile data
 */
export const useUserProfile = () => {
  const {
    profile,
    setProfile,
    updateProfile,
    setLoading,
    setUpdating,
    setError,
  } = useUserProfileStore();
  const { user } = useAuthStore();
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Fetch user profile from Supabase
   */
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // If profile doesn't exist, create it in the database
        if (fetchError.code === 'PGRST116') {
          const displayName = user.email?.split('@')[0] || 'User';
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: displayName,
              display_name: displayName,
            })
            .select('*')
            .single();

          if (createError) {
            setError(`Failed to create user profile: ${createError.message}`);
            return { success: false };
          }

          // Map snake_case to camelCase for frontend
          const profile: UserProfile = {
            id: newProfile.id,
            email: newProfile.email,
            fullName: newProfile.full_name,
            displayName: newProfile.display_name,
            playerRole: newProfile.player_role as PlayerRole | null,
            profilePictureUrl: newProfile.profile_picture_url,
            bio: newProfile.bio,
            dateOfBirth: newProfile.date_of_birth,
            phoneNumber: newProfile.phone_number,
            location: newProfile.location,
            battingAverage: newProfile.batting_average,
            strikeRate: newProfile.strike_rate,
            economyRate: newProfile.economy_rate,
            wickets: newProfile.wickets || 0,
            runs: newProfile.runs || 0,
            matchesPlayed: newProfile.matches_played || 0,
            rating: newProfile.rating || 0,
            createdAt: newProfile.created_at,
            updatedAt: newProfile.updated_at,
          };

          setProfile(profile);
          return { success: true, data: profile };
        }

        setError(fetchError.message);
        return { success: false };
      }

      // Map snake_case to camelCase for frontend
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        displayName: data.display_name,
        playerRole: data.player_role as PlayerRole | null,
        profilePictureUrl: data.profile_picture_url,
        bio: data.bio,
        dateOfBirth: data.date_of_birth,
        phoneNumber: data.phone_number,
        location: data.location,
        battingAverage: data.batting_average,
        strikeRate: data.strike_rate,
        economyRate: data.economy_rate,
        wickets: data.wickets || 0,
        runs: data.runs || 0,
        matchesPlayed: data.matches_played || 0,
        rating: data.rating || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setProfile(profile);
      return { success: true, data: profile };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, setProfile, setLoading, setError]);

  /**
   * Update user profile in Supabase
   */
  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Convert camelCase updates to snake_case for database
        const dbUpdates: any = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.playerRole !== undefined) dbUpdates.player_role = updates.playerRole;
        if (updates.profilePictureUrl !== undefined) dbUpdates.profile_picture_url = updates.profilePictureUrl;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
        if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.battingAverage !== undefined) dbUpdates.batting_average = updates.battingAverage;
        if (updates.strikeRate !== undefined) dbUpdates.strike_rate = updates.strikeRate;
        if (updates.economyRate !== undefined) dbUpdates.economy_rate = updates.economyRate;
        if (updates.wickets !== undefined) dbUpdates.wickets = updates.wickets;
        if (updates.runs !== undefined) dbUpdates.runs = updates.runs;
        if (updates.matchesPlayed !== undefined) dbUpdates.matches_played = updates.matchesPlayed;
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
        dbUpdates.updated_at = new Date().toISOString();

        const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update(dbUpdates)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        // Map snake_case to camelCase for frontend
        const updatedProfile: UserProfile = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          displayName: data.display_name,
          playerRole: data.player_role as PlayerRole | null,
          profilePictureUrl: data.profile_picture_url,
          bio: data.bio,
          dateOfBirth: data.date_of_birth,
          phoneNumber: data.phone_number,
          location: data.location,
          battingAverage: data.batting_average,
          strikeRate: data.strike_rate,
          economyRate: data.economy_rate,
          wickets: data.wickets || 0,
          runs: data.runs || 0,
          matchesPlayed: data.matches_played || 0,
          rating: data.rating || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // Update Zustand store
        updateProfile(updates);
        setProfile(updatedProfile);

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, updateProfile, setProfile, setUpdating, setError]
  );

  /**
   * Upload profile picture to Supabase Storage
   */
  const uploadProfilePicture = useCallback(
    async (imageUri: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false, url: null };
      }

      setUpdating(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Convert image to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileExt = imageUri.split('.').pop() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile-pictures/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          setError(uploadError.message);
          return { success: false, url: null };
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        // Update profile with new picture URL
        const updateResult = await updateUserProfile({
          profilePictureUrl: publicUrl,
        });

        if (!updateResult.success) {
          return { success: false, url: null };
        }

        setUploadProgress(100);
        return { success: true, url: publicUrl };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMessage);
        return { success: false, url: null };
      } finally {
        setUpdating(false);
        setUploadProgress(0);
      }
    },
    [user, updateUserProfile, setUpdating, setError]
  );

  /**
   * Calculate and update player rating based on stats
   */
  const calculateRating = useCallback(
    (stats: {
      battingAverage?: number | null;
      strikeRate?: number | null;
      economyRate?: number | null;
      wickets?: number;
      runs?: number;
      matchesPlayed?: number;
    }) => {
      let rating = 0;

      // Batting contribution (max 40 points)
      if (stats.battingAverage && stats.battingAverage > 0) {
        rating += Math.min(stats.battingAverage / 5, 20); // Up to 20 points for average
      }
      if (stats.strikeRate && stats.strikeRate > 0) {
        rating += Math.min(stats.strikeRate / 10, 20); // Up to 20 points for strike rate
      }

      // Bowling contribution (max 30 points)
      if (stats.economyRate && stats.economyRate > 0) {
        rating += Math.min(30 / stats.economyRate, 20); // Lower economy = higher points
      }
      if (stats.wickets && stats.wickets > 0) {
        rating += Math.min(stats.wickets / 5, 10); // Up to 10 points for wickets
      }

      // Experience contribution (max 30 points)
      if (stats.matchesPlayed && stats.matchesPlayed > 0) {
        rating += Math.min(stats.matchesPlayed / 2, 30); // Up to 30 points for matches
      }

      return Math.round(rating * 10) / 10; // Round to 1 decimal place
    },
    []
  );

  /**
   * Update profile statistics
   */
  const updateStats = useCallback(
    async (stats: {
      battingAverage?: number | null;
      strikeRate?: number | null;
      economyRate?: number | null;
      wickets?: number;
      runs?: number;
      matchesPlayed?: number;
    }) => {
      const newRating = calculateRating({
        ...profile,
        ...stats,
      } as any);

      return await updateUserProfile({
        ...stats,
        rating: newRating,
      });
    },
    [profile, calculateRating, updateUserProfile]
  );

  return {
    profile,
    fetchProfile,
    updateUserProfile,
    uploadProfilePicture,
    updateStats,
    uploadProgress,
  };
};


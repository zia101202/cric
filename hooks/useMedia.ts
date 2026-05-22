import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';

/**
 * Media type
 */
export type MediaType = 'image' | 'video';

/**
 * Media interface
 */
export interface Media {
  id: string;
  ownerId: string;
  type: MediaType;
  url: string;
  thumbUrl: string | null;
  meta: Record<string, any>;
  isModerated: boolean;
  createdAt: string;
}

/**
 * Media upload options
 */
export interface UploadOptions {
  maxSize?: number; // in MB
  maxDuration?: number; // in seconds for videos
  quality?: number; // 0-1 for images
  generateThumbnail?: boolean;
}

/**
 * Custom hook for media operations
 * Handles upload, list, delete, and thumbnail generation
 */
export const useMedia = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request media library permissions
   */
  const requestPermissions = useCallback(async (type: 'photo' | 'video' | 'all') => {
    try {
      if (type === 'photo' || type === 'all') {
        const { status: photoStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (photoStatus !== 'granted') {
          return { success: false, error: 'Photo library permission denied' };
        }
      }

      if (type === 'video' || type === 'all') {
        const { status: videoStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (videoStatus !== 'granted') {
          return { success: false, error: 'Video library permission denied' };
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Pick image from library
   */
  const pickImage = useCallback(async (options?: ImagePicker.ImagePickerOptions) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        ...options,
      });

      if (result.canceled || !result.assets[0]) {
        return { success: false, error: 'No image selected' };
      }

      return { success: true, data: result.assets[0] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick image';
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Pick video from library
   */
  const pickVideo = useCallback(async (options?: ImagePicker.ImagePickerOptions) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
        ...options,
      });

      if (result.canceled || !result.assets[0]) {
        return { success: false, error: 'No video selected' };
      }

      return { success: true, data: result.assets[0] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick video';
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Upload media file to Supabase Storage
   */
  const uploadMedia = useCallback(
    async (
      fileUri: string,
      mediaType: MediaType,
      options: UploadOptions = {}
    ) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Read file
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Validate file size
        const fileSizeMB = blob.size / (1024 * 1024);
        if (options.maxSize && fileSizeMB > options.maxSize) {
          return {
            success: false,
            error: `File size exceeds ${options.maxSize}MB limit`,
          };
        }

        // Generate file path
        const fileExt = fileUri.split('.').pop() || (mediaType === 'image' ? 'jpg' : 'mp4');
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const bucket = mediaType === 'image' ? 'match-images' : 'match-videos';
        const filePath = `${bucket}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        setUploadProgress(50);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        // Generate thumbnail for videos (placeholder - would need server-side processing)
        let thumbUrl: string | null = null;
        if (mediaType === 'video' && options.generateThumbnail) {
          // In production, this would trigger a server-side function
          // For now, we'll use the video URL as placeholder
          thumbUrl = publicUrl;
        }

        // Create media record
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .insert({
            owner_id: user.id,
            type: mediaType,
            url: publicUrl,
            thumb_url: thumbUrl,
            meta: {
              size: blob.size,
              duration: options.maxDuration || null,
              uploadedAt: new Date().toISOString(),
            },
            is_moderated: false,
          })
          .select()
          .single();

        if (mediaError) {
          throw mediaError;
        }

        setUploadProgress(100);

        const media: Media = {
          id: mediaData.id,
          ownerId: mediaData.owner_id,
          type: mediaData.type as MediaType,
          url: mediaData.url,
          thumbUrl: mediaData.thumb_url,
          meta: mediaData.meta || {},
          isModerated: mediaData.is_moderated || false,
          createdAt: mediaData.created_at,
        };

        return { success: true, data: media };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    },
    [user]
  );

  /**
   * List media for a match
   */
  const listMatchMedia = useCallback(async (matchId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('match_media')
        .select('*, media(*)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mediaList: Media[] =
        data?.map((item: any) => ({
          id: item.media.id,
          ownerId: item.media.owner_id,
          type: item.media.type as MediaType,
          url: item.media.url,
          thumbUrl: item.media.thumb_url,
          meta: item.media.meta || {},
          isModerated: item.media.is_moderated || false,
          createdAt: item.media.created_at,
        })) || [];

      return { success: true, data: mediaList };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Attach media to match
   */
  const attachMediaToMatch = useCallback(
    async (matchId: string, mediaId: string, caption?: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: attachError } = await supabase
          .from('match_media')
          .insert({
            match_id: matchId,
            media_id: mediaId,
            caption: caption || null,
            uploader_id: user.id,
          })
          .select()
          .single();

        if (attachError) {
          throw attachError;
        }

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to attach media';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Delete media (owner or admin only)
   */
  const deleteMedia = useCallback(async (mediaId: string) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user is owner or admin
      const { data: media, error: fetchError } = await supabase
        .from('media')
        .select('owner_id, url')
        .eq('id', mediaId)
        .single();

      if (fetchError || !media) {
        return { success: false, error: 'Media not found' };
      }

      // Check permissions (owner or admin)
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const isAdmin = userRole?.role === 'admin' || userRole?.role === 'moderator';
      const isOwner = media.owner_id === user.id;

      if (!isOwner && !isAdmin) {
        return { success: false, error: 'Permission denied' };
      }

      // Delete from match_media first
      await supabase.from('match_media').delete().eq('media_id', mediaId);

      // Delete media record
      const { error: deleteError } = await supabase.from('media').delete().eq('id', mediaId);

      if (deleteError) {
        throw deleteError;
      }

      // Delete from storage (extract bucket and path from URL)
      // This would need proper URL parsing in production
      // For now, we'll just delete the record

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get user's media
   */
  const getUserMedia = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return { success: false, error: 'User ID required' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('owner_id', targetUserId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mediaList: Media[] =
        data?.map((item: any) => ({
          id: item.id,
          ownerId: item.owner_id,
          type: item.type as MediaType,
          url: item.url,
          thumbUrl: item.thumb_url,
          meta: item.meta || {},
          isModerated: item.is_moderated || false,
          createdAt: item.created_at,
        })) || [];

      return { success: true, data: mediaList };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    uploadProgress,
    error,
    requestPermissions,
    pickImage,
    pickVideo,
    uploadMedia,
    listMatchMedia,
    attachMediaToMatch,
    deleteMedia,
    getUserMedia,
  };
};


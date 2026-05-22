import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, IconButton, ProgressBar, Text, Menu } from 'react-native-paper';
import { useMedia } from '../hooks/useMedia';
import { MediaType } from '../hooks/useMedia';

/**
 * Media upload button component props
 */
interface MediaUploadButtonProps {
  onUploadComplete?: (mediaId: string) => void;
  onUploadError?: (error: string) => void;
  mediaType?: MediaType;
  maxSize?: number; // in MB
  disabled?: boolean;
  matchId?: string; // Optional: attach to match immediately
  caption?: string;
}

/**
 * Media upload button component
 * Handles media selection and upload with progress tracking
 */
export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({
  onUploadComplete,
  onUploadError,
  mediaType = 'image',
  maxSize = 10,
  disabled = false,
  matchId,
  caption,
}) => {
  const { pickImage, pickVideo, uploadMedia, attachMediaToMatch, loading, uploadProgress, error } =
    useMedia();
  const [showMenu, setShowMenu] = useState(false);

  const handleImagePick = async () => {
    setShowMenu(false);
    const result = await pickImage({
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.success || !result.data) {
      onUploadError?.(result.error || 'Failed to pick image');
      return;
    }

    await uploadAndAttach(result.data.uri, 'image');
  };

  const handleVideoPick = async () => {
    setShowMenu(false);
    const result = await pickVideo({
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.success || !result.data) {
      onUploadError?.(result.error || 'Failed to pick video');
      return;
    }

    await uploadAndAttach(result.data.uri, 'video');
  };

  const uploadAndAttach = async (uri: string, type: MediaType) => {
    const uploadResult = await uploadMedia(uri, type, {
      maxSize,
      generateThumbnail: type === 'video',
    });

    if (!uploadResult.success || !uploadResult.data) {
      onUploadError?.(uploadResult.error || 'Upload failed');
      return;
    }

    // Attach to match if provided
    if (matchId && uploadResult.data) {
      const attachResult = await attachMediaToMatch(matchId, uploadResult.data.id, caption);
      if (!attachResult.success) {
        Alert.alert('Warning', 'Media uploaded but failed to attach to match');
      }
    }

    onUploadComplete?.(uploadResult.data.id);
  };

  if (mediaType === 'image') {
    return (
      <View style={styles.container}>
        <Button
          mode="outlined"
          onPress={handleImagePick}
          disabled={disabled || loading}
          icon="image"
          style={styles.button}
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </Button>
        {loading && (
          <View style={styles.progressContainer}>
            <ProgressBar progress={uploadProgress / 100} color="#007AFF" />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </Text>
          </View>
        )}
        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  if (mediaType === 'video') {
    return (
      <View style={styles.container}>
        <Button
          mode="outlined"
          onPress={handleVideoPick}
          disabled={disabled || loading}
          icon="video"
          style={styles.button}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </Button>
        {loading && (
          <View style={styles.progressContainer}>
            <ProgressBar progress={uploadProgress / 100} color="#007AFF" />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </Text>
          </View>
        )}
        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Both image and video
  return (
    <View style={styles.container}>
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <IconButton
            icon="plus"
            size={24}
            onPress={() => setShowMenu(true)}
            disabled={disabled || loading}
          />
        }
      >
        <Menu.Item onPress={handleImagePick} title="Upload Image" leadingIcon="image" />
        <Menu.Item onPress={handleVideoPick} title="Upload Video" leadingIcon="video" />
      </Menu>
      {loading && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={uploadProgress / 100} color="#007AFF" />
          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(uploadProgress)}%
          </Text>
        </View>
      )}
      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 4,
    textAlign: 'center',
  },
});


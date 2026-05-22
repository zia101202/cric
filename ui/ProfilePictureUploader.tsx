import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar, Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePictureUploaderProps {
  currentImageUrl: string | null;
  onImageSelected: (imageUri: string) => Promise<{ success: boolean }>;
  disabled?: boolean;
  size?: number;
}

/**
 * Profile picture uploader component
 * Allows users to select, preview, and upload profile pictures
 */
export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  disabled = false,
  size = 120,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Request camera/library permissions and pick image
   */
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  /**
   * Upload selected image
   */
  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const result = await onImageSelected(selectedImage);
      if (result.success) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Cancel image selection
   */
  const handleCancel = () => {
    setSelectedImage(null);
  };

  const displayImage = selectedImage || currentImageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            accessibilityLabel="Profile picture"
          />
        ) : (
          <Avatar.Icon
            size={size}
            icon="account"
            style={[styles.avatar, { width: size, height: size }]}
          />
        )}

        {!disabled && (
          <TouchableOpacity
            style={[styles.editButton, { bottom: size * 0.1 }]}
            onPress={pickImage}
            accessibilityLabel="Change profile picture"
          >
            <IconButton icon="camera" size={20} iconColor="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {selectedImage && !isUploading && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleUpload}
            style={styles.uploadButton}
            accessibilityLabel="Upload profile picture"
          >
            Upload
          </Button>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel upload"
          >
            Cancel
          </Button>
        </View>
      )}

      {isUploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text variant="bodySmall" style={styles.uploadingText}>
            Uploading...
          </Text>
        </View>
      )}

      {!selectedImage && !disabled && (
        <View style={styles.optionsContainer}>
          <Button
            mode="text"
            onPress={pickImage}
            icon="image"
            compact
            accessibilityLabel="Choose from gallery"
          >
            Gallery
          </Button>
          <Button
            mode="text"
            onPress={takePhoto}
            icon="camera"
            compact
            accessibilityLabel="Take photo"
          >
            Camera
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatar: {
    backgroundColor: '#e0e0e0',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  uploadButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  uploadingText: {
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});


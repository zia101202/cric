import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface WinningMomentUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

/**
 * Winning moment image uploader component
 * Allows users to upload multiple images for match winning moments
 */
export const WinningMomentUploader: React.FC<WinningMomentUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    if (images.length >= maxImages) {
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets
          .slice(0, maxImages - images.length)
          .map((asset) => asset.uri);
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    if (images.length >= maxImages) {
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  /**
   * Remove image
   */
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <Text variant="titleSmall" style={styles.title}>
          Winning Moment Images
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Upload up to {maxImages} images ({images.length}/{maxImages})
        </Text>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                {!disabled && (
                  <IconButton
                    icon="close-circle"
                    size={24}
                    iconColor="#fff"
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                    accessibilityLabel={`Remove image ${index + 1}`}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {!disabled && images.length < maxImages && (
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              onPress={pickImage}
              icon="image"
              style={styles.button}
              disabled={isUploading}
              accessibilityLabel="Choose images from gallery"
            >
              Gallery
            </Button>
            <Button
              mode="outlined"
              onPress={takePhoto}
              icon="camera"
              style={styles.button}
              disabled={isUploading}
              accessibilityLabel="Take photo with camera"
            >
              Camera
            </Button>
          </View>
        )}

        {isUploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text variant="bodySmall" style={styles.uploadingText}>
              Uploading images...
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  imageList: {
    marginVertical: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  uploadingText: {
    color: '#666',
  },
});


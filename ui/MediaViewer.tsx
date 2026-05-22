import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Modal, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { Image } from 'react-native';
import { Media } from '../hooks/useMedia';

/**
 * Media viewer component props
 */
interface MediaViewerProps {
  media: Media | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (mediaId: string) => void;
  canDelete?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Media viewer component
 * Full-screen media viewer with zoom and delete options
 */
export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  visible,
  onClose,
  onDelete,
  canDelete = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!media) return null;

  const handleDelete = () => {
    if (onDelete && media) {
      onDelete(media.id);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={styles.modal}
      dismissable
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="close" onPress={onClose} iconColor="#fff" />
          {canDelete && onDelete && (
            <IconButton icon="delete" onPress={handleDelete} iconColor="#fff" />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {media.type === 'image' ? (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <Image
                source={{ uri: media.url }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            </View>
          ) : (
            <View style={styles.videoContainer}>
              <Text variant="bodyLarge" style={styles.videoMessage}>
                Video playback requires video player integration
              </Text>
              <Text variant="bodyMedium" style={styles.videoUrl}>
                {media.url}
              </Text>
            </View>
          )}
        </ScrollView>

        {media.meta && Object.keys(media.meta).length > 0 && (
          <View style={styles.metaContainer}>
            <Text variant="bodySmall" style={styles.metaText}>
              {media.meta.size && `Size: ${(media.meta.size / 1024 / 1024).toFixed(2)} MB`}
              {media.meta.duration && ` • Duration: ${media.meta.duration}s`}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#000',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoMessage: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  videoUrl: {
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  metaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  metaText: {
    color: '#fff',
    textAlign: 'center',
  },
});


import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useMedia, Media } from '../../hooks/useMedia';
import { MediaGrid } from '../../ui/MediaGrid';
import { MediaViewer } from '../../ui/MediaViewer';
import { MediaUploadButton } from '../../ui/MediaUploadButton';

/**
 * Match media screen props
 */
interface MatchMediaScreenProps {
  route: {
    params: {
      matchId: string;
    };
  };
  navigation: any;
}

/**
 * Match media screen
 * Displays and manages media for a specific match
 */
export const MatchMediaScreen: React.FC<MatchMediaScreenProps> = ({ route, navigation }) => {
  const { matchId } = route.params;
  const { listMatchMedia, deleteMedia, loading, error } = useMedia();
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadMedia();
  }, [matchId]);

  const loadMedia = async () => {
    const result = await listMatchMedia(matchId);
    if (result.success && result.data) {
      setMedia(result.data);
    }
  };

  const handleMediaPress = (item: Media) => {
    setSelectedMedia(item);
    setViewerVisible(true);
  };

  const handleMediaLongPress = (item: Media) => {
    // Show delete confirmation
    // In production, use a proper confirmation dialog
    handleDeleteMedia(item.id);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const result = await deleteMedia(mediaId);
    if (result.success) {
      setSnackbarMessage('Media deleted successfully');
      setSnackbarVisible(true);
      loadMedia();
    } else {
      setSnackbarMessage(result.error || 'Failed to delete media');
      setSnackbarVisible(true);
    }
  };

  const handleUploadComplete = (mediaId: string) => {
    setSnackbarMessage('Media uploaded successfully');
    setSnackbarVisible(true);
    loadMedia();
  };

  const handleUploadError = (error: string) => {
    setSnackbarMessage(error);
    setSnackbarVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Match Media
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Photos and videos from this match
            </Text>
          </Card.Content>
        </Card>

        {loading && media.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <MediaGrid
            media={media}
            onMediaPress={handleMediaPress}
            onMediaLongPress={handleMediaLongPress}
            columns={3}
            emptyMessage="No media uploaded yet"
          />
        )}

        <Card style={styles.uploadCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.uploadTitle}>
              Upload Media
            </Text>
            <MediaUploadButton
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              matchId={matchId}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <MediaViewer
        media={selectedMedia}
        visible={viewerVisible}
        onClose={() => {
          setViewerVisible(false);
          setSelectedMedia(null);
        }}
        onDelete={handleDeleteMedia}
        canDelete={true}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCard: {
    marginTop: 16,
  },
  uploadTitle: {
    marginBottom: 12,
  },
});


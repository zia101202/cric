import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import { Media } from '../../hooks/useMedia';
import { MediaGrid } from '../../ui/MediaGrid';
import { MediaViewer } from '../../ui/MediaViewer';

/**
 * Tournament media screen props
 */
interface TournamentMediaScreenProps {
  route: {
    params: {
      tournamentId: string;
    };
  };
  navigation: any;
}

/**
 * Tournament media screen
 * Displays media from all matches in a tournament
 */
export const TournamentMediaScreen: React.FC<TournamentMediaScreenProps> = ({
  route,
  navigation,
}) => {
  const { tournamentId } = route.params;
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadTournamentMedia();
  }, [tournamentId]);

  const loadTournamentMedia = async () => {
    try {
      setLoading(true);

      // Get all matches in tournament
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .eq('tournament_id', tournamentId);

      if (matchesError) {
        throw matchesError;
      }

      if (!matches || matches.length === 0) {
        setMedia([]);
        setLoading(false);
        return;
      }

      // Get media from all matches
      const matchIds = matches.map((m) => m.id);
      const { data: matchMedia, error: mediaError } = await supabase
        .from('match_media')
        .select('*, media(*)')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false });

      if (mediaError) {
        throw mediaError;
      }

      const mediaList: Media[] =
        matchMedia?.map((item: any) => ({
          id: item.media.id,
          ownerId: item.media.owner_id,
          type: item.media.type,
          url: item.media.url,
          thumbUrl: item.media.thumb_url,
          meta: item.media.meta || {},
          isModerated: item.media.is_moderated || false,
          createdAt: item.media.created_at,
        })) || [];

      setMedia(mediaList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media';
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaPress = (item: Media) => {
    setSelectedMedia(item);
    setViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Tournament Media
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Photos and videos from all matches
            </Text>
          </Card.Content>
        </Card>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <MediaGrid
            media={media}
            onMediaPress={handleMediaPress}
            columns={3}
            emptyMessage="No media available for this tournament"
          />
        )}
      </ScrollView>

      <MediaViewer
        media={selectedMedia}
        visible={viewerVisible}
        onClose={() => {
          setViewerVisible(false);
          setSelectedMedia(null);
        }}
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
});


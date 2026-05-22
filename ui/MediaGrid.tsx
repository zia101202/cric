import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { Media } from '../hooks/useMedia';

/**
 * Media grid component props
 */
interface MediaGridProps {
  media: Media[];
  onMediaPress?: (media: Media) => void;
  onMediaLongPress?: (media: Media) => void;
  columns?: number;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Media grid component
 * Displays media items in a grid layout
 */
export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  onMediaPress,
  onMediaLongPress,
  columns = 3,
  loading = false,
  emptyMessage = 'No media available',
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (media.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const itemWidth = `${100 / columns - 1}%`;

  return (
    <View style={styles.container}>
      {media.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, { width: itemWidth }]}
          onPress={() => onMediaPress?.(item)}
          onLongPress={() => onMediaLongPress?.(item)}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {item.type === 'image' ? (
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.videoContainer}>
                  <Image
                    source={{ uri: item.thumbUrl || item.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.playIcon}>
                    <Text style={styles.playIconText}>▶</Text>
                  </View>
                </View>
              )}
              {item.type === 'video' && (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>VIDEO</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  item: {
    marginBottom: 8,
    marginHorizontal: 2,
  },
  card: {
    margin: 0,
    elevation: 2,
  },
  cardContent: {
    padding: 0,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
  },
  videoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});


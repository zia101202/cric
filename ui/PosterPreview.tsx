import React from 'react';
import { Card, CardContent, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet, Image, Share, Alert } from 'react-native';

interface PosterPreviewProps {
  imageUrl?: string;
  matchTitle?: string;
  mvpName?: string;
  loading?: boolean;
  onGenerate?: () => void;
  onShare?: () => void;
}

/**
 * PosterPreview component
 * Displays a preview of a shareable match poster with MVP and trophy
 */
export const PosterPreview: React.FC<PosterPreviewProps> = ({
  imageUrl,
  matchTitle,
  mvpName,
  loading = false,
  onGenerate,
  onShare,
}) => {
  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else if (imageUrl) {
      try {
        await Share.share({
          message: `Check out this match result! ${matchTitle || ''} - MVP: ${mvpName || ''}`,
          url: imageUrl,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share poster');
      }
    }
  };

  return (
    <Card style={styles.card} accessibilityLabel="Match poster preview">
      <CardContent>
        <Title style={styles.title}>Match Poster</Title>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Paragraph style={styles.loadingText}>Generating poster...</Paragraph>
          </View>
        ) : imageUrl ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.posterImage} resizeMode="contain" />
            {matchTitle && <Paragraph style={styles.matchTitle}>{matchTitle}</Paragraph>}
            {mvpName && (
              <View style={styles.mvpContainer}>
                <Paragraph style={styles.mvpLabel}>MVP:</Paragraph>
                <Paragraph style={styles.mvpName}>{mvpName}</Paragraph>
              </View>
            )}
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleShare}
                icon="share"
                style={styles.shareButton}
                accessibilityLabel="Share poster"
              >
                Share
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              Generate a shareable poster for this match
            </Paragraph>
            {onGenerate && (
              <Button
                mode="contained"
                onPress={onGenerate}
                icon="image"
                style={styles.generateButton}
                accessibilityLabel="Generate poster"
              >
                Generate Poster
              </Button>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  previewContainer: {
    alignItems: 'center',
  },
  posterImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  mvpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mvpLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  mvpName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  actions: {
    marginTop: 16,
    width: '100%',
  },
  shareButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
});


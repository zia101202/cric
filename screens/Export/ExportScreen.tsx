import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  SegmentedButtons,
  ActivityIndicator,
  List,
  Button,
} from 'react-native-paper';
import { useExport, ExportFormat } from '../../hooks/useExport';
import { useMatchManagement } from '../../hooks/useMatchManagement';
import { useTournament } from '../../hooks/useTournament';
import { ExportButton } from '../../ui/ExportButton';
import { PosterPreview } from '../../ui/PosterPreview';
// Note: Requires expo-file-system and expo-sharing packages
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

/**
 * ExportScreen
 * Allows users to export match scorecards, tournament data, and generate shareable posters
 */
export const ExportScreen: React.FC = () => {
  const { loading, error, exportProgress, exportScorecard, exportTournament, generatePoster } =
    useExport();
  const { matches } = useMatchManagement();
  const { tournaments } = useTournament();
  const [exportType, setExportType] = useState<'scorecard' | 'tournament' | 'poster'>('scorecard');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (exportType === 'scorecard' && selectedMatchId) {
      const result = await exportScorecard(selectedMatchId, { format });
      if (result.success && result.data) {
        await saveAndShareFile(result.data, `scorecard-${selectedMatchId}.${format}`, result.mimeType);
      } else {
        Alert.alert('Export Failed', result.error || 'Failed to export scorecard');
      }
    } else if (exportType === 'tournament' && selectedTournamentId) {
      const result = await exportTournament(selectedTournamentId, { format });
      if (result.success && result.data) {
        await saveAndShareFile(
          result.data,
          `tournament-${selectedTournamentId}.${format}`,
          result.mimeType
        );
      } else {
        Alert.alert('Export Failed', result.error || 'Failed to export tournament');
      }
    }
  };

  const saveAndShareFile = async (content: string, filename: string, mimeType: string) => {
    try {
      // TODO: Implement file saving and sharing
      // Requires expo-file-system and expo-sharing packages
      // For now, show content in alert or copy to clipboard
      Alert.alert('Export Ready', `File: ${filename}\n\nContent length: ${content.length} characters\n\nNote: File saving requires expo-file-system package.`);
      
      // Alternative: Copy to clipboard
      // import * as Clipboard from 'expo-clipboard';
      // await Clipboard.setStringAsync(content);
      // Alert.alert('Copied', 'Content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save file');
    }
  };

  const handleGeneratePoster = async () => {
    const matchId = selectedMatchId;
    if (!matchId) {
      Alert.alert('Error', 'Please select a match first');
      return;
    }

    const result = await generatePoster(matchId);
    if (result.success && result.data) {
      setPosterUrl(result.data.imageUrl);
    } else {
      Alert.alert('Error', result.error || 'Failed to generate poster');
    }
  };

  const handleSharePoster = async () => {
    if (posterUrl) {
      try {
        await Share.share({
          message: 'Check out this match result!',
          url: posterUrl,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share poster');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Export & Share</Title>
        <Paragraph style={styles.headerSubtitle}>
          Export match scorecards, tournament data, or generate shareable posters
        </Paragraph>
      </Surface>

      <SegmentedButtons
        value={exportType}
        onValueChange={(value) => setExportType(value as 'scorecard' | 'tournament' | 'poster')}
        buttons={[
          { value: 'scorecard', label: 'Scorecard' },
          { value: 'tournament', label: 'Tournament' },
          { value: 'poster', label: 'Poster' },
        ]}
        style={styles.segmentedButtons}
      />

      {exportType === 'scorecard' && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Select Match</Title>
          {matches.length === 0 ? (
            <Paragraph style={styles.emptyText}>No matches available</Paragraph>
          ) : (
            matches.map((match) => (
              <List.Item
                key={match.id}
                title={match.team1?.name + ' vs ' + match.team2?.name}
                description={new Date(match.scheduledDate || match.createdAt).toLocaleDateString()}
                right={() => (
                  <ExportButton onExport={handleExport} loading={loading} disabled={!match.id} />
                )}
                onPress={() => setSelectedMatchId(match.id)}
                selected={selectedMatchId === match.id}
                accessibilityLabel={`Select match: ${match.team1?.name} vs ${match.team2?.name}`}
              />
            ))
          )}
        </Surface>
      )}

      {exportType === 'tournament' && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Select Tournament</Title>
          {tournaments.length === 0 ? (
            <Paragraph style={styles.emptyText}>No tournaments available</Paragraph>
          ) : (
            tournaments.map((tournament) => (
              <List.Item
                key={tournament.id}
                title={tournament.name}
                description={tournament.format + ' • ' + tournament.status}
                right={() => (
                  <ExportButton
                    onExport={handleExport}
                    loading={loading}
                    disabled={!tournament.id}
                  />
                )}
                onPress={() => setSelectedTournamentId(tournament.id)}
                selected={selectedTournamentId === tournament.id}
                accessibilityLabel={`Select tournament: ${tournament.name}`}
              />
            ))
          )}
        </Surface>
      )}

      {exportType === 'poster' && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Generate Match Poster</Title>
          <List.Item
            title="Select Match"
            description="Choose a match to generate a poster for"
            right={() => (
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Open match picker
                }}
              >
                Select
              </Button>
            )}
          />
          <PosterPreview
            imageUrl={posterUrl || undefined}
            loading={loading}
            onGenerate={handleGeneratePoster}
            onShare={handleSharePoster}
          />
        </Surface>
      )}

      {loading && exportProgress > 0 && (
        <Surface style={styles.progressContainer}>
          <Paragraph>Exporting... {exportProgress}%</Paragraph>
          <ActivityIndicator style={styles.progressIndicator} />
        </Surface>
      )}

      {error && (
        <Surface style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Surface>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  progressContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressIndicator: {
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
});


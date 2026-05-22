import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useTournamentManagement } from '../../hooks/useTournamentManagement';
import { useTournamentManagementStore } from '../../store/tournamentManagementStore';

/**
 * Tournament Detail Screen
 * Fetches and displays tournament information
 */
export function TournamentDetailScreen() {
  const route = useRoute();
  const { tournamentId } = route.params as { tournamentId: string };
  const { fetchTournamentById } = useTournamentManagement();
  const { currentTournament, isLoading, error } = useTournamentManagementStore();

  React.useEffect(() => {
    fetchTournamentById(tournamentId);
  }, [fetchTournamentById, tournamentId]);

  const isCurrentTournament = currentTournament?.id === tournamentId;

  if (isLoading && !isCurrentTournament) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.helperText}>Loading tournament details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!currentTournament) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Tournament not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">{currentTournament.name}</Text>
            <Chip style={styles.statusChip}>{currentTournament.status.toUpperCase()}</Chip>
          </View>
          {currentTournament.description && (
            <>
              <Text variant="bodyMedium" style={styles.description}>
                {currentTournament.description}
              </Text>
              <Divider style={styles.divider} />
            </>
          )}
          <Text variant="bodyMedium">Format: {currentTournament.format}</Text>
          <Text variant="bodyMedium">Type: {currentTournament.type}</Text>
          <Text variant="bodyMedium">
            Entry Fee: {currentTournament.entryFee > 0 ? `PKR ${currentTournament.entryFee}` : 'Free'}
          </Text>
          <Text variant="bodyMedium">Organizer: {currentTournament.creatorName}</Text>
          <Text variant="bodySmall" style={styles.meta}>
            Created: {new Date(currentTournament.createdAt).toLocaleDateString()}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            Updated: {new Date(currentTournament.updatedAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Participation</Text>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{currentTournament.currentTeams}</Text>
              <Text variant="bodySmall">Current Teams</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{currentTournament.minTeams}</Text>
              <Text variant="bodySmall">Min Teams</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{currentTournament.totalMatches}</Text>
              <Text variant="bodySmall">Total Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{currentTournament.completedMatches}</Text>
              <Text variant="bodySmall">Completed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {currentTournament.prizeDistribution?.length ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Prize Distribution</Text>
            <Divider style={styles.divider} />
            {currentTournament.prizeDistribution.map((prize) => (
              <View key={prize.position} style={styles.prizeRow}>
                <Text variant="bodyLarge">#{prize.position}</Text>
                <Text variant="bodyMedium">
                  {prize.amount ? `PKR ${prize.amount.toLocaleString()}` : '--'}
                  {prize.percentage && ` (${prize.percentage}%)`}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helperText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: '#E3F2FD',
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
    color: '#444',
  },
  divider: {
    marginVertical: 12,
  },
  meta: {
    color: '#888',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexBasis: '45%',
    paddingVertical: 8,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});


import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useMatchManagement } from '../../hooks/useMatchManagement';
import { useMatchStore } from '../../store/matchStore';
import { useTournamentManagement } from '../../hooks/useTournamentManagement';

const formatDate = (date?: string) => {
  if (!date) {
    return 'Date TBD';
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date TBD';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (time?: string) => {
  if (!time) {
    return '--:--';
  }
  return time.slice(0, 5);
};

export function MatchDetailScreen() {
  const route = useRoute();
  const { matchId } = route.params as { matchId: string };
  const { currentMatch, fetchMatch } = useMatchManagement();
  const { isLoading, error } = useMatchStore();
  const { fetchTournamentById } = useTournamentManagement();
  const [tournamentName, setTournamentName] = React.useState<string>('');
  const [isTournamentLoading, setIsTournamentLoading] = React.useState(false);

  React.useEffect(() => {
    fetchMatch(matchId);
  }, [fetchMatch, matchId]);

  React.useEffect(() => {
    let isMounted = true;
    const loadTournament = async () => {
      if (!currentMatch?.tournamentId) {
        setTournamentName('');
        return;
      }
      setIsTournamentLoading(true);
      const result = await fetchTournamentById(currentMatch.tournamentId);
      if (isMounted) {
        if (result.success && result.data) {
          setTournamentName(result.data.name);
        } else {
          setTournamentName('');
        }
        setIsTournamentLoading(false);
      }
    };
    loadTournament();
    return () => {
      isMounted = false;
    };
  }, [currentMatch?.tournamentId, fetchTournamentById]);

  const isCurrentMatch = currentMatch?.id === matchId;

  const renderScorecard = (teamLabel: string, scorecard?: any) => {
    if (!scorecard) {
      return (
        <Text variant="bodySmall" style={styles.placeholder}>
          Scorecard not reported yet
        </Text>
      );
    }

    return (
      <View style={styles.scorecardWrapper}>
        <Text variant='titleMedium' style={styles.scoreLine}>
          {scorecard.runs}/{scorecard.wickets} ({scorecard.overs} ov)
        </Text>
        <Divider style={styles.divider} />
        {scorecard.players?.length ? (
          scorecard.players.map((player: any) => (
            <View key={`${teamLabel}-${player.playerId}`} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.playerName}</Text>
              <Text style={styles.playerStats}>
                {player.runs} ({player.balls}){player.isOut ? '' : '*'}
              </Text>
            </View>
          ))
        ) : (
          <Text variant="bodySmall" style={styles.placeholder}>
            Player stats unavailable
          </Text>
        )}
      </View>
    );
  };

  if (isLoading || !isCurrentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="titleMedium" style={styles.errorText}>
          Failed to load match
        </Text>
        <Text variant="bodySmall">{error}</Text>
      </View>
    );
  }

  if (!currentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="bodyMedium">Match not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">{currentMatch.team1Name || 'Team 1'} vs {currentMatch.team2Name || 'Team 2'}</Text>
            <Chip style={styles.statusChip}>{currentMatch.status.toUpperCase()}</Chip>
          </View>
          <Text variant="bodyMedium" style={styles.metaText}>
            Tournament:{' '}
            {isTournamentLoading
              ? 'Loading...'
              : tournamentName || currentMatch.tournamentId || 'N/A'}
          </Text>
          <Text variant="bodyMedium" style={styles.metaText}>
            Format: {currentMatch.format || 'N/A'}
          </Text>
          <Text variant="bodyMedium" style={styles.metaText}>
            Scheduled: {formatDate(currentMatch.scheduledDate)} • {formatTime(currentMatch.scheduledTime)}
          </Text>
          <Text variant="bodyMedium" style={styles.metaText}>
            Venue: {currentMatch.venueName || 'Venue TBD'}
          </Text>
        </Card.Content>
      </Card>

      {currentMatch.result && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Result</Text>
            <Text variant="bodyLarge" style={styles.resultText}>
              {currentMatch.result.winnerName} won by {currentMatch.result.winningMargin}
            </Text>
            <Text variant="bodySmall">MVP: {currentMatch.result.mvpName}</Text>
            <Text variant="bodySmall">Performance: {currentMatch.result.mvpStats}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Team 1</Text>
          {renderScorecard('team1', currentMatch.team1Scorecard)}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Team 2</Text>
          {renderScorecard('team2', currentMatch.team2Scorecard)}
        </Card.Content>
      </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: '#E3F2FD',
  },
  metaText: {
    marginTop: 4,
    color: '#555',
  },
  resultText: {
    marginVertical: 8,
    fontWeight: '600',
  },
  scorecardWrapper: {
    marginTop: 12,
  },
  scoreLine: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  playerName: {
    fontWeight: '500',
  },
  playerStats: {
    color: '#555',
  },
  placeholder: {
    color: '#888',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
});


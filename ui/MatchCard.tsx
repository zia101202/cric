import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip, Icon } from 'react-native-paper';
import { Match, MatchStatus } from '../store/matchStore';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  showDetails?: boolean;
}

/**
 * Match card component
 * Displays match summary with teams, scores, and status
 */
export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress, showDetails = false }) => {
  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'live':
        return '#f44336';
      case 'scheduled':
        return '#2196f3';
      case 'cancelled':
        return '#9e9e9e';
      case 'invalid':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: MatchStatus): string => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'live':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      case 'cancelled':
        return 'Cancelled';
      case 'postponed':
        return 'Postponed';
      case 'invalid':
        return 'Invalid';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) {
      return 'Date TBD';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Date TBD';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString?: string | null): string => {
    if (!timeString) {
      return '--:--';
    }
    return timeString.slice(0, 5); // HH:MM format
  };

  return (
    <Card
      style={styles.card}
      mode="outlined"
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`Match between ${match.team1Name || 'Team 1'} and ${match.team2Name || 'Team 2'}`}
    >
      <Card.Content>
        <View style={styles.header}>
          <Chip
            icon="calendar"
            style={[styles.statusChip, { backgroundColor: getStatusColor(match.status) + '20' }]}
            textStyle={{ color: getStatusColor(match.status), fontSize: 10 }}
          >
            {getStatusLabel(match.status)}
          </Chip>
          <Text variant="bodySmall" style={styles.dateText}>
            {formatDate(match.scheduledDate)} • {formatTime(match.scheduledTime)}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <Text variant="titleMedium" style={styles.teamName}>
              {match.team1Name || 'Team 1'}
            </Text>
            {match.team1Scorecard && (
              <Text variant="headlineSmall" style={styles.score}>
                {match.team1Scorecard.runs}/{match.team1Scorecard.wickets}
              </Text>
            )}
          </View>

          <Text variant="titleLarge" style={styles.vsText}>
            VS
          </Text>

          <View style={styles.teamContainer}>
            <Text variant="titleMedium" style={styles.teamName}>
              {match.team2Name || 'Team 2'}
            </Text>
            {match.team2Scorecard && (
              <Text variant="headlineSmall" style={styles.score}>
                {match.team2Scorecard.runs}/{match.team2Scorecard.wickets}
              </Text>
            )}
          </View>
        </View>

        {match.result && (
          <View style={styles.resultContainer}>
            <Icon source="trophy" size={20} color="#FFD700" />
            <Text variant="bodyMedium" style={styles.resultText}>
              {match.result.winnerName} won by {match.result.winningMargin}
            </Text>
          </View>
        )}

        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.venueRow}>
              <Icon source="map-marker" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.venueText}>
                {match.venueName || 'Venue TBD'}
              </Text>
            </View>
            {match.format && (
              <Text variant="bodySmall" style={styles.formatText}>
                Format: {match.format}
              </Text>
            )}
          </View>
        )}

        {match.winningMomentImages && match.winningMomentImages.length > 0 && (
          <View style={styles.imagesContainer}>
            {match.winningMomentImages.slice(0, 3).map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    height: 24,
  },
  dateText: {
    color: '#666',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  score: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  vsText: {
    fontWeight: 'bold',
    color: '#999',
    marginHorizontal: 16,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  resultText: {
    fontWeight: '600',
    color: '#4caf50',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  venueText: {
    color: '#666',
    flex: 1,
  },
  formatText: {
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});


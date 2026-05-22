import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, Avatar, Chip } from 'react-native-paper';
import { Match } from '../store/matchStore';

interface MatchHistoryItemProps {
  match: Match;
  onPress?: () => void;
  userId?: string;
}

/**
 * Match history item component
 * Displays a match in the user's match history list
 */
export const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({
  match,
  onPress,
  userId,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Determine if user's team won
  const userTeamId = userId
    ? match.team1Scorecard?.teamId === userId || match.team2Scorecard?.teamId === userId
      ? userId
      : null
    : null;

  const isWinner =
    userTeamId && match.result
      ? match.result.winnerId === userTeamId
      : false;

  // Get user's team scorecard
  const userTeamScorecard =
    userId && match.team1Scorecard?.teamId === userId
      ? match.team1Scorecard
      : userId && match.team2Scorecard?.teamId === userId
      ? match.team2Scorecard
      : null;

  const opponentScorecard =
    userId && match.team1Scorecard?.teamId === userId
      ? match.team2Scorecard
      : userId && match.team2Scorecard?.teamId === userId
      ? match.team1Scorecard
      : null;

  return (
    <List.Item
      title={
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.title}>
            {match.team1Name} vs {match.team2Name}
          </Text>
          {isWinner && (
            <Chip icon="trophy" style={styles.winnerChip} textStyle={styles.winnerChipText}>
              Won
            </Chip>
          )}
        </View>
      }
      description={
        <View style={styles.descriptionContainer}>
          <Text variant="bodySmall" style={styles.dateText}>
            {formatDate(match.scheduledDate)} • {match.venueName}
          </Text>
          {userTeamScorecard && opponentScorecard && (
            <View style={styles.scoreContainer}>
              <Text variant="bodyMedium" style={styles.scoreText}>
                {userTeamScorecard.runs}/{userTeamScorecard.wickets} vs{' '}
                {opponentScorecard.runs}/{opponentScorecard.wickets}
              </Text>
            </View>
          )}
          {match.result && (
            <Text variant="bodySmall" style={styles.resultText}>
              {match.result.winnerName} won by {match.result.winningMargin}
            </Text>
          )}
        </View>
      }
      left={() => (
        <Avatar.Icon
          size={48}
          icon={isWinner ? 'trophy' : 'cricket'}
          style={[styles.avatar, isWinner && styles.winnerAvatar]}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
          {match.result?.mvpName && (
            <Text variant="bodySmall" style={styles.mvpText}>
              MVP: {match.result.mvpName}
            </Text>
          )}
        </View>
      )}
      onPress={onPress}
      style={styles.listItem}
      accessible={true}
      accessibilityLabel={`Match ${match.team1Name} vs ${match.team2Name} on ${formatDate(match.scheduledDate)}`}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
  winnerChip: {
    height: 24,
    backgroundColor: '#4caf50',
  },
  winnerChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 4,
  },
  dateText: {
    color: '#666',
    marginBottom: 4,
  },
  scoreContainer: {
    marginVertical: 4,
  },
  scoreText: {
    fontWeight: '600',
    color: '#333',
  },
  resultText: {
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  avatar: {
    backgroundColor: '#007AFF',
  },
  winnerAvatar: {
    backgroundColor: '#4caf50',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  mvpText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 10,
  },
});


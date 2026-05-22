import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Avatar, Text, IconButton } from 'react-native-paper';
import { PlayerScorecard } from '../store/matchStore';

interface PlayerScoreRowProps {
  player: PlayerScorecard;
  onEdit?: () => void;
  onReport?: () => void;
  showActions?: boolean;
  isEditable?: boolean;
}

/**
 * Player score row component
 * Displays individual player statistics in a match scorecard
 */
export const PlayerScoreRow: React.FC<PlayerScoreRowProps> = ({
  player,
  onEdit,
  onReport,
  showActions = false,
  isEditable = false,
}) => {
  const getPlayerInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'batsman':
        return 'cricket';
      case 'bowler':
        return 'bowling';
      case 'wicketkeeper':
        return 'shield';
      default:
        return 'account';
    }
  };

  return (
    <List.Item
      title={player.playerName}
      description={
        <View style={styles.descriptionContainer}>
          <Text variant="bodySmall" style={styles.statsText}>
            {player.runs} runs ({player.balls} balls) • SR: {player.strikeRate.toFixed(2)}
          </Text>
          {player.wickets !== undefined && player.wickets > 0 && (
            <Text variant="bodySmall" style={styles.statsText}>
              {player.wickets} wkts • {player.overs} ov • Econ: {player.economy?.toFixed(2) || '0.00'}
            </Text>
          )}
          {player.isOut && player.dismissalType && (
            <Text variant="bodySmall" style={styles.dismissalText}>
              {player.dismissalType}
              {player.dismissedBy && ` b ${player.dismissedBy}`}
            </Text>
          )}
        </View>
      }
      left={(props) => (
        <Avatar.Text
          {...props}
          size={40}
          label={getPlayerInitials(player.playerName)}
          style={styles.avatar}
        />
      )}
      right={() =>
        showActions ? (
          <View style={styles.actionsContainer}>
            {isEditable && onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={onEdit}
                accessibilityLabel={`Edit ${player.playerName} score`}
              />
            )}
            {onReport && (
              <IconButton
                icon="alert-circle"
                size={20}
                onPress={onReport}
                accessibilityLabel={`Report error for ${player.playerName}`}
              />
            )}
          </View>
        ) : null
      }
      style={styles.listItem}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 4,
  },
  descriptionContainer: {
    marginTop: 4,
  },
  statsText: {
    color: '#666',
    marginBottom: 2,
  },
  dismissalText: {
    color: '#d32f2f',
    fontStyle: 'italic',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#007AFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});


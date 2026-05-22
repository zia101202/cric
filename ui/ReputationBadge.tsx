import React from 'react';
import { Chip, Avatar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { ReputationLevel } from '../hooks/useReputation';

interface ReputationBadgeProps {
  level: ReputationLevel;
  points?: number;
  size?: 'small' | 'medium' | 'large';
  showPoints?: boolean;
}

/**
 * ReputationBadge component
 * Displays a reputation level badge with icon and optional points
 */
export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  level,
  points,
  size = 'medium',
  showPoints = false,
}) => {
  const getLevelConfig = (level: ReputationLevel) => {
    switch (level) {
      case 'Diamond':
        return { color: '#B9F2FF', icon: '💎', textColor: '#000' };
      case 'Platinum':
        return { color: '#E5E4E2', icon: '⚪', textColor: '#000' };
      case 'Gold':
        return { color: '#FFD700', icon: '🥇', textColor: '#000' };
      case 'Silver':
        return { color: '#C0C0C0', icon: '🥈', textColor: '#000' };
      default:
        return { color: '#CD7F32', icon: '🥉', textColor: '#fff' };
    }
  };

  const config = getLevelConfig(level);
  const sizeStyles = {
    small: { height: 24, fontSize: 12 },
    medium: { height: 32, fontSize: 14 },
    large: { height: 40, fontSize: 16 },
  };

  return (
    <View style={styles.container} accessibilityLabel={`Reputation level: ${level}`}>
      <Chip
        style={[
          styles.chip,
          {
            backgroundColor: config.color,
            height: sizeStyles[size].height,
          },
        ]}
        textStyle={[
          styles.chipText,
          {
            color: config.textColor,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
        icon={() => (
          <Avatar.Text
            size={sizeStyles[size].height - 8}
            label={config.icon}
            style={styles.avatar}
          />
        )}
      >
        {level}
        {showPoints && points !== undefined && ` (${points})`}
      </Chip>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontWeight: '600',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
});


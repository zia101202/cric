import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge, Text } from 'react-native-paper';

/**
 * Props for NotificationBadge component
 */
interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

/**
 * NotificationBadge component
 * Badge on icons for notifications
 * Push-style UI for in-app alerts
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'small',
  showZero = false,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'medium':
        return 12;
      case 'large':
        return 14;
      default:
        return 10;
    }
  };

  return (
    <View style={styles.container}>
      <Badge
        size={getSize()}
        style={styles.badge}
      >
        <Text style={[styles.badgeText, { fontSize: getFontSize() }]}>
          {displayCount}
        </Text>
      </Badge>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    backgroundColor: '#f44336',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


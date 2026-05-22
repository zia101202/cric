import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  subtitle?: string;
  highlight?: boolean;
  badge?: string;
  testID?: string;
}

/**
 * Stat card component for displaying player statistics
 * Shows stats in an attractive card format with optional icons and badges
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  highlight = false,
  badge,
  testID,
}) => {
  return (
    <Card
      style={[styles.card, highlight && styles.highlightCard]}
      mode="outlined"
      testID={testID}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {icon && <Icon source={icon} size={24} color={highlight ? '#007AFF' : '#666'} />}
          <Text variant="labelSmall" style={[styles.title, highlight && styles.highlightTitle]}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text variant="labelSmall" style={styles.badgeText}>
                {badge}
              </Text>
            </View>
          )}
        </View>

        <Text variant="headlineMedium" style={[styles.value, highlight && styles.highlightValue]}>
          {value}
        </Text>

        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    minWidth: 140,
    backgroundColor: '#ffffff',
  },
  highlightCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  title: {
    flex: 1,
    color: '#666',
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  highlightTitle: {
    color: '#007AFF',
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  highlightValue: {
    color: '#007AFF',
  },
  subtitle: {
    color: '#999',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#333',
    fontSize: 9,
    fontWeight: 'bold',
  },
});


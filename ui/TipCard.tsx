import React from 'react';
import { Card, CardContent, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { CoachingTip } from '../hooks/useCoaching';

interface TipCardProps {
  tip: CoachingTip;
  onSave?: () => void;
  onAddToCalendar?: () => void;
}

/**
 * TipCard component
 * Displays a coaching tip with category, reason, and actionable steps
 */
export const TipCard: React.FC<TipCardProps> = ({ tip, onSave, onAddToCalendar }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'batting':
        return '#4CAF50';
      case 'bowling':
        return '#2196F3';
      case 'fielding':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <Card style={styles.card} accessibilityLabel={`Tip: ${tip.title}`}>
      <CardContent>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Chip
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(tip.category) }]}
              textStyle={styles.chipText}
              accessibilityLabel={`Category: ${tip.category}`}
            >
              {tip.category}
            </Chip>
            <Chip
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(tip.priority) }]}
              textStyle={styles.chipText}
              accessibilityLabel={`Priority: ${tip.priority}`}
            >
              {tip.priority}
            </Chip>
          </View>
          {onSave && (
            <IconButton
              icon="bookmark-outline"
              size={20}
              onPress={onSave}
              accessibilityLabel="Save tip"
            />
          )}
        </View>

        <Title style={styles.title} accessibilityRole="header">
          {tip.title}
        </Title>

        <Paragraph style={styles.description}>{tip.description}</Paragraph>

        {tip.reason && (
          <View style={styles.reasonContainer}>
            <Paragraph style={styles.reasonLabel}>Why this tip:</Paragraph>
            <Paragraph style={styles.reason}>{tip.reason}</Paragraph>
          </View>
        )}

        {tip.drill && (
          <View style={styles.drillContainer}>
            <Paragraph style={styles.drillLabel}>Suggested drill:</Paragraph>
            <Paragraph style={styles.drill}>{tip.drill}</Paragraph>
          </View>
        )}

        {onAddToCalendar && (
          <View style={styles.actions}>
            <IconButton
              icon="calendar-plus"
              size={20}
              onPress={onAddToCalendar}
              accessibilityLabel="Add drill to calendar"
            />
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    height: 28,
  },
  priorityChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  reasonContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: '#424242',
  },
  drillContainer: {
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  drillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 4,
  },
  drill: {
    fontSize: 13,
    color: '#424242',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});


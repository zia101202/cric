import React from 'react';
import { List, Avatar, Divider } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ReputationEvent } from '../hooks/useReputation';

interface ReputationTimelineProps {
  events: ReputationEvent[];
}

/**
 * ReputationTimeline component
 * Displays a timeline of reputation events
 */
export const ReputationTimeline: React.FC<ReputationTimelineProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'match_win':
        return '🏆';
      case 'match_participation':
        return '✅';
      case 'positive_report':
        return '👍';
      case 'milestone':
        return '⭐';
      case 'community_action':
        return '💬';
      case 'poor_conduct':
        return '⚠️';
      case 'dispute':
        return '❌';
      default:
        return '📌';
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'match_win':
        return 'Match Win';
      case 'match_participation':
        return 'Match Participation';
      case 'positive_report':
        return 'Positive Report';
      case 'milestone':
        return 'Milestone Achievement';
      case 'community_action':
        return 'Community Action';
      case 'poor_conduct':
        return 'Poor Conduct';
      case 'dispute':
        return 'Dispute';
      default:
        return eventType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <List.Subheader>No reputation events yet</List.Subheader>
        </View>
      ) : (
        events.map((event, index) => (
          <View key={event.id}>
            <List.Item
              title={getEventTitle(event.eventType)}
              description={formatDate(event.createdAt)}
              left={() => (
                <Avatar.Text
                  size={40}
                  label={getEventIcon(event.eventType)}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: event.points > 0 ? '#E8F5E9' : '#FFEBEE',
                    },
                  ]}
                />
              )}
              right={() => (
                <List.Subheader
                  style={[
                    styles.points,
                    { color: event.points > 0 ? '#4CAF50' : '#F44336' },
                  ]}
                >
                  {event.points > 0 ? '+' : ''}
                  {event.points}
                </List.Subheader>
              )}
              accessibilityLabel={`${getEventTitle(event.eventType)}: ${event.points} points`}
            />
            {index < events.length - 1 && <Divider />}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
});


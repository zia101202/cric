import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  ProgressBar,
  ActivityIndicator,
  SegmentedButtons,
  List,
} from 'react-native-paper';
import { useReputation, ReputationTotals, ReputationEvent, Badge } from '../../hooks/useReputation';
import { ReputationBadge } from '../../ui/ReputationBadge';
import { ReputationTimeline } from '../../ui/ReputationTimeline';

/**
 * ReputationScreen
 * Displays user reputation, level, badges, and event timeline
 */
export const ReputationScreen: React.FC = () => {
  const {
    loading,
    error,
    getReputationTotals,
    getReputationEvents,
    getBadges,
  } = useReputation();
  const [totals, setTotals] = useState<ReputationTotals | null>(null);
  const [events, setEvents] = useState<ReputationEvent[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'badges'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const totalsResult = await getReputationTotals();
    if (totalsResult.success && totalsResult.data) {
      setTotals(totalsResult.data);
    }

    const eventsResult = await getReputationEvents();
    if (eventsResult.success && eventsResult.data) {
      setEvents(eventsResult.data);
    }

    const badgesResult = await getBadges();
    if (badgesResult.success && badgesResult.data) {
      setBadges(badgesResult.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getNextLevelPoints = (currentLevel: string, currentPoints: number): number => {
    switch (currentLevel) {
      case 'Bronze':
        return 500;
      case 'Silver':
        return 2000;
      case 'Gold':
        return 5000;
      case 'Platinum':
        return 10000;
      default:
        return 0;
    }
  };

  const getProgress = (): number => {
    if (!totals) return 0;
    const nextLevelPoints = getNextLevelPoints(totals.level, totals.totalPoints);
    if (nextLevelPoints === 0) return 100; // Max level
    const currentLevelPoints = getCurrentLevelPoints(totals.level);
    const progress = ((totals.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getCurrentLevelPoints = (level: string): number => {
    switch (level) {
      case 'Bronze':
        return 0;
      case 'Silver':
        return 500;
      case 'Gold':
        return 2000;
      case 'Platinum':
        return 5000;
      case 'Diamond':
        return 10000;
      default:
        return 0;
    }
  };

  if (loading && !totals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading reputation...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Reputation & Achievements</Title>
        <Paragraph style={styles.headerSubtitle}>
          Track your progress and earn badges through your cricket journey
        </Paragraph>
      </Surface>

      {totals && (
        <Surface style={styles.statsCard}>
          <View style={styles.levelContainer}>
            <ReputationBadge level={totals.level} points={totals.totalPoints} size="large" />
          </View>
          <View style={styles.pointsContainer}>
            <Title style={styles.pointsTitle}>{totals.totalPoints.toLocaleString()}</Title>
            <Paragraph style={styles.pointsLabel}>Total Points</Paragraph>
          </View>
          <View style={styles.progressContainer}>
            <Paragraph style={styles.progressLabel}>
              Progress to {getNextLevelPoints(totals.level, totals.totalPoints) === 0 ? 'Max Level' : 'Next Level'}
            </Paragraph>
            <ProgressBar progress={getProgress() / 100} color="#4CAF50" style={styles.progressBar} />
            <Paragraph style={styles.progressText}>
              {totals.totalPoints} / {getNextLevelPoints(totals.level, totals.totalPoints) || 'Max'}
            </Paragraph>
          </View>
        </Surface>
      )}

      <SegmentedButtons
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'overview' | 'timeline' | 'badges')}
        buttons={[
          { value: 'overview', label: 'Overview' },
          { value: 'timeline', label: 'Timeline' },
          { value: 'badges', label: 'Badges' },
        ]}
        style={styles.segmentedButtons}
      />

      {viewMode === 'overview' && totals && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Reputation Summary</Title>
          <List.Item
            title="Current Level"
            description={totals.level}
            left={() => <List.Icon icon="trophy" />}
          />
          <List.Item
            title="Total Points"
            description={totals.totalPoints.toLocaleString()}
            left={() => <List.Icon icon="star" />}
          />
          <List.Item
            title="Badges Earned"
            description={`${totals.badges.length} badges`}
            left={() => <List.Icon icon="medal" />}
          />
        </Surface>
      )}

      {viewMode === 'timeline' && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Reputation Timeline</Title>
          <ReputationTimeline events={events} />
        </Surface>
      )}

      {viewMode === 'badges' && (
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Earned Badges</Title>
          {badges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>No badges earned yet</Paragraph>
            </View>
          ) : (
            badges.map((badge) => (
              <List.Item
                key={badge.id}
                title={badge.name}
                description={badge.description}
                left={() => <List.Icon icon={badge.icon} />}
                right={() => (
                  <Paragraph style={styles.badgeDate}>
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </Paragraph>
                )}
              />
            ))
          )}
        </Surface>
      )}

      {error && (
        <Surface style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Surface>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  levelContainer: {
    marginBottom: 16,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    width: '100%',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  badgeDate: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
});


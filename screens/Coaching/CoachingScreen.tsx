import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  SegmentedButtons,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useCoaching, CoachingTip, PerformanceAnalysis } from '../../hooks/useCoaching';
import { TipCard } from '../../ui/TipCard';
import { TrainingPlan } from '../../ui/TrainingPlan';

/**
 * CoachingScreen
 * Displays personalized coaching tips and performance analysis
 */
export const CoachingScreen: React.FC = () => {
  const { loading, error, getCoachingTips, getPerformanceAnalysis } = useCoaching();
  const [viewMode, setViewMode] = useState<'tips' | 'analysis' | 'plan'>('tips');
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [completedTips, setCompletedTips] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tipsResult = await getCoachingTips();
    if (tipsResult.success && tipsResult.data) {
      setTips(tipsResult.data);
    }

    const analysisResult = await getPerformanceAnalysis();
    if (analysisResult.success && analysisResult.data) {
      setAnalysis(analysisResult.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTipComplete = (tipId: string) => {
    setCompletedTips((prev) =>
      prev.includes(tipId) ? prev.filter((id) => id !== tipId) : [...prev, tipId]
    );
  };

  const handleSaveTip = (tip: CoachingTip) => {
    // TODO: Implement save to favorites
    console.log('Saving tip:', tip.id);
  };

  const handleAddToCalendar = (tip: CoachingTip) => {
    // TODO: Implement calendar integration
    console.log('Adding to calendar:', tip.id);
  };

  if (loading && !tips.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading coaching tips...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Coaching & Tips</Title>
        <Paragraph style={styles.headerSubtitle}>
          Personalized recommendations based on your performance
        </Paragraph>
      </Surface>

      {analysis && (
        <Surface style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <Title style={styles.ratingTitle}>Overall Performance</Title>
            <Chip style={styles.ratingChip}>{analysis.overallRating}/100</Chip>
          </View>
          {analysis.strengths.length > 0 && (
            <View style={styles.strengthsContainer}>
              <Paragraph style={styles.sectionLabel}>Strengths:</Paragraph>
              {analysis.strengths.map((strength, index) => (
                <Chip key={index} style={styles.strengthChip} icon="check-circle">
                  {strength}
                </Chip>
              ))}
            </View>
          )}
          {analysis.weaknesses.length > 0 && (
            <View style={styles.weaknessesContainer}>
              <Paragraph style={styles.sectionLabel}>Areas to Improve:</Paragraph>
              {analysis.weaknesses.map((weakness, index) => (
                <Chip key={index} style={styles.weaknessChip} icon="alert-circle">
                  {weakness}
                </Chip>
              ))}
            </View>
          )}
        </Surface>
      )}

      <SegmentedButtons
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'tips' | 'analysis' | 'plan')}
        buttons={[
          { value: 'tips', label: 'Tips' },
          { value: 'plan', label: 'Plan' },
          { value: 'analysis', label: 'Analysis' },
        ]}
        style={styles.segmentedButtons}
      />

      {viewMode === 'tips' && (
        <View style={styles.tipsContainer}>
          {tips.length === 0 ? (
            <Surface style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                No tips available. Play more matches to get personalized recommendations.
              </Paragraph>
            </Surface>
          ) : (
            tips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                onSave={() => handleSaveTip(tip)}
                onAddToCalendar={() => handleAddToCalendar(tip)}
              />
            ))
          )}
        </View>
      )}

      {viewMode === 'plan' && (
        <TrainingPlan
          tips={tips}
          onTipComplete={handleTipComplete}
          completedTips={completedTips}
        />
      )}

      {viewMode === 'analysis' && analysis && (
        <Surface style={styles.analysisContainer}>
          <Title style={styles.analysisTitle}>Detailed Analysis</Title>
          {analysis.recommendations.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
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
  ratingCard: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingChip: {
    backgroundColor: '#4CAF50',
  },
  strengthsContainer: {
    marginBottom: 12,
  },
  weaknessesContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  strengthChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
  },
  weaknessChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFEBEE',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tipsContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  analysisContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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


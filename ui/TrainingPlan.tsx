import React from 'react';
import { Card, CardContent, Title, Paragraph, List, Checkbox } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { CoachingTip } from '../hooks/useCoaching';

interface TrainingPlanProps {
  tips: CoachingTip[];
  onTipComplete?: (tipId: string) => void;
  completedTips?: string[];
}

/**
 * TrainingPlan component
 * Displays a list of coaching tips as a training plan with checkboxes
 */
export const TrainingPlan: React.FC<TrainingPlanProps> = ({
  tips,
  onTipComplete,
  completedTips = [],
}) => {
  const groupedTips = tips.reduce(
    (acc, tip) => {
      if (!acc[tip.category]) {
        acc[tip.category] = [];
      }
      acc[tip.category].push(tip);
      return acc;
    },
    {} as Record<string, CoachingTip[]>
  );

  return (
    <ScrollView style={styles.container}>
      {Object.entries(groupedTips).map(([category, categoryTips]) => (
        <Card key={category} style={styles.categoryCard} accessibilityLabel={`${category} tips`}>
          <CardContent>
            <Title style={styles.categoryTitle}>{category.toUpperCase()} Training</Title>
            {categoryTips.map((tip) => (
              <View key={tip.id} style={styles.tipItem}>
                <View style={styles.tipContent}>
                  {onTipComplete && (
                    <Checkbox
                      status={completedTips.includes(tip.id) ? 'checked' : 'unchecked'}
                      onPress={() => onTipComplete(tip.id)}
                      accessibilityLabel={`Mark ${tip.title} as complete`}
                    />
                  )}
                  <View style={styles.tipText}>
                    <Paragraph style={styles.tipTitle}>{tip.title}</Paragraph>
                    {tip.drill && (
                      <Paragraph style={styles.tipDrill}>{tip.drill}</Paragraph>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryCard: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  tipItem: {
    marginBottom: 12,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  tipDrill: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});


import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

/**
 * Team Analytics Screen
 */
export function TeamAnalyticsScreen() {
  const route = useRoute();
  const { teamId } = route.params as { teamId: string };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">Team Analytics</Text>
          <Text variant="bodyMedium">Team ID: {teamId}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
});


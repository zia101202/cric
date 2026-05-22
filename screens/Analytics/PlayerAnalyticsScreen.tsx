import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

/**
 * Player Analytics Screen
 */
export function PlayerAnalyticsScreen() {
  const route = useRoute();
  const { playerId } = route.params as { playerId: string };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">Player Analytics</Text>
          <Text variant="bodyMedium">Player ID: {playerId}</Text>
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


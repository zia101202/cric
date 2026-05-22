import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * Analytics Screen
 * Overview of player and team analytics
 */
export function AnalyticsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Player Analytics</Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PlayerAnalytics' as never, { playerId: 'current' } as never)}
            style={styles.button}
          >
            View My Analytics
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Team Analytics</Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('TeamAnalytics' as never, { teamId: 'current' } as never)}
            style={styles.button}
          >
            View Team Analytics
          </Button>
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
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
});


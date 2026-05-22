import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

/**
 * Admin Screen
 * Admin dashboard and controls
 */
export function AdminScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Admin Dashboard</Text>
          <Text variant="bodyMedium" style={styles.description}>
            Manage users, tournaments, matches, and disputes
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Quick Actions</Text>
          <Button mode="outlined" style={styles.button}>
            Manage Users
          </Button>
          <Button mode="outlined" style={styles.button}>
            Manage Tournaments
          </Button>
          <Button mode="outlined" style={styles.button}>
            View Disputes
          </Button>
          <Button mode="outlined" style={styles.button}>
            Financial Reports
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
  description: {
    color: '#666',
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});


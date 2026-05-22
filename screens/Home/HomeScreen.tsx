import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Surface, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfileStore } from '../../store/userProfileStore';

/**
 * Home Screen
 * Main dashboard showing overview of tournaments, matches, and activities
 */
export function HomeScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { profile } = useUserProfileStore();

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.welcomeText}>
          Welcome, {profile?.displayName || user?.email || 'Player'}!
        </Text>
        <Button mode="outlined" onPress={logout} style={styles.logoutButton}>
          Logout
        </Button>
      </Surface>

      <View style={styles.content}>
        {/* Quick Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Your Stats
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall">{profile?.matchesPlayed || 0}</Text>
                <Text variant="bodySmall">Matches</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall">{profile?.runs || 0}</Text>
                <Text variant="bodySmall">Runs</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall">{profile?.wickets || 0}</Text>
                <Text variant="bodySmall">Wickets</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall">{profile?.rating?.toFixed(1) || '0.0'}</Text>
                <Text variant="bodySmall">Rating</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Upcoming Matches */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Upcoming Matches
            </Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No upcoming matches
            </Text>
          </Card.Content>
        </Card>

        {/* Active Tournaments */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Active Tournaments
            </Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No active tournaments
            </Text>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Recent Activity
            </Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No recent activity
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#007AFF',
  },
  welcomeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    borderColor: '#fff',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});


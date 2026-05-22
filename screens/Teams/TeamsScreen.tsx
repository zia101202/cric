import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTeamStore } from '../../store/teamStore';
import { useTeam } from '../../hooks/useTeam';

/**
 * Teams Screen
 * Lists all teams user is part of or can join
 */
export function TeamsScreen() {
  const navigation = useNavigation();
  const { teams, isLoading } = useTeamStore();
  const { fetchTeams } = useTeam();

  // Refresh teams when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTeams();
    }, [fetchTeams])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('TeamDetail' as never, { teamId: item.id } as never)}
          >
            <Card.Content>
              <Text variant="titleLarge">{item.name}</Text>
              <Text variant="bodyMedium" style={styles.status}>
                Status: {item.status}
              </Text>
              <Text variant="bodySmall" style={styles.players}>
                Players: {item.acceptedPlayers}/{item.minPlayers}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No teams found
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateTeam' as never)}
            >
              Create Team
            </Button>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTeam' as never)}
        label="Create Team"
      />
    </View>
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
    elevation: 2,
  },
  status: {
    color: '#666',
    marginTop: 4,
  },
  players: {
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


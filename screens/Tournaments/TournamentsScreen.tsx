import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTournamentManagementStore } from '../../store/tournamentManagementStore';
import { useTournamentManagement } from '../../hooks/useTournamentManagement';

/**
 * Tournaments Screen
 * Lists all tournaments
 */
export function TournamentsScreen() {
  const navigation = useNavigation();
  const { tournaments, isLoading } = useTournamentManagementStore();
  const { fetchTournaments } = useTournamentManagement();

  // Refresh tournaments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTournaments();
    }, [fetchTournaments])
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
        data={tournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('TournamentDetail' as never, { tournamentId: item.id } as never)}
          >
            <Card.Content>
              <Text variant="titleLarge">{item.name}</Text>
              <Text variant="bodyMedium" style={styles.status}>
                Status: {item.status}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No tournaments found
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateTournament' as never)}
            >
              Create Tournament
            </Button>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTournament' as never)}
        label="Create Tournament"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});


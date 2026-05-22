import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { usePlayerDirectory } from '../../hooks/usePlayerDirectory';
import { usePlayerDirectoryStore } from '../../store/playerDirectoryStore';
import { StatCard } from '../../ui/StatCard';

type PlayerDetailRoute = RouteProp<RootStackParamList, 'PlayerDetail'>;

export const PlayerDetailScreen: React.FC = () => {
  const route = useRoute<PlayerDetailRoute>();
  const navigation = useNavigation();
  const { playerId } = route.params;
  const { fetchPlayerById, clearSelection } = usePlayerDirectory();
  const { selectedPlayer, isLoading, error } = usePlayerDirectoryStore();
  const tabNav = navigation.getParent();

  useEffect(() => {
    fetchPlayerById(playerId);
    return () => {
      clearSelection();
    };
  }, [playerId, fetchPlayerById, clearSelection]);

  if (isLoading && !selectedPlayer) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Loading player details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!selectedPlayer) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Player not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          {selectedPlayer.profilePictureUrl ? (
            <Image
              source={{ uri: selectedPlayer.profilePictureUrl }}
              style={styles.avatar}
              accessibilityLabel={`${selectedPlayer.displayName} avatar`}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text variant="headlineSmall">
                {selectedPlayer.displayName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {selectedPlayer.displayName}
          </Text>
          {selectedPlayer.location && (
            <Text variant="bodyMedium" style={styles.location}>
              📍 {selectedPlayer.location}
            </Text>
          )}
          <View style={styles.badges}>
            {selectedPlayer.playerRole && (
              <Chip icon="account" style={styles.badge}>
                {selectedPlayer.playerRole}
              </Chip>
            )}
            <Chip icon="star" style={styles.badge}>
              Rating {selectedPlayer.rating?.toFixed(1) || '0.0'}
            </Chip>
          </View>
          {selectedPlayer.bio && (
            <Text variant="bodyMedium" style={styles.bio}>
              {selectedPlayer.bio}
            </Text>
          )}
          <Button
            mode="contained"
            icon="message"
            style={styles.messageButton}
            onPress={() => {
              navigation.navigate('Chat', {
                recipientId: selectedPlayer.id,
                recipientName: selectedPlayer.displayName || selectedPlayer.fullName,
              });
            }}
          >
            Message Player
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Performance Snapshot</Text>
          <Divider style={styles.divider} />
          <View style={styles.statsGrid}>
            <StatCard
              title="Matches Played"
              value={selectedPlayer.matchesPlayed.toString()}
              icon="calendar"
            />
            <StatCard
              title="Runs"
              value={selectedPlayer.runs.toString()}
              icon="run"
            />
            <StatCard
              title="Wickets"
              value={selectedPlayer.wickets.toString()}
              icon="target"
            />
            <StatCard
              title="Batting Avg"
              value={selectedPlayer.battingAverage?.toFixed(2) || '0.00'}
              icon="chart-line"
            />
            <StatCard
              title="Strike Rate"
              value={selectedPlayer.strikeRate?.toFixed(2) || '0.00'}
              icon="speedometer"
            />
            <StatCard
              title="Economy"
              value={selectedPlayer.economyRate?.toFixed(2) || '0.00'}
              icon="chart-bell-curve"
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarFallback: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    color: '#666',
  },
  bio: {
    marginTop: 12,
    textAlign: 'center',
    color: '#444',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  badge: {
    marginHorizontal: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  messageButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});



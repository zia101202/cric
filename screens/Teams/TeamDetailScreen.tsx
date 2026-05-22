import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTeamStore } from '../../store/teamStore';
import { useTeam } from '../../hooks/useTeam';
import { StatCard } from '../../ui/StatCard';
import { useTeamPlayers } from '../../hooks/useTeamPlayers';
import { useAuthStore } from '../../store/authStore';
import { InvitePlayersModal } from '../../components/teams/InvitePlayersModal';

type TeamDetailRoute = RouteProp<RootStackParamList, 'TeamDetail'>;

/**
 * Team Detail Screen
 * Fetches full team info and displays current status, leadership and key stats
 */
export function TeamDetailScreen() {
  const route = useRoute<TeamDetailRoute>();
  const { teamId } = route.params;
  const { fetchTeamById } = useTeam();
  const { currentTeam, isLoading, error, setCurrentTeam } = useTeamStore();
  const { user } = useAuthStore();
  const { teamPlayers: getTeamPlayers, fetchTeamPlayers } = useTeamPlayers();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  useEffect(() => {
    fetchTeamById(teamId);
    return () => {
      setCurrentTeam(null);
    };
  }, [teamId, fetchTeamById, setCurrentTeam]);

  useEffect(() => {
    fetchTeamPlayers(teamId);
  }, [teamId, fetchTeamPlayers]);

  useFocusEffect(
    useCallback(() => {
      fetchTeamPlayers(teamId);
    }, [teamId, fetchTeamPlayers])
  );

  const teamPlayers = getTeamPlayers(teamId);
  const acceptedPlayers = useMemo(
    () => teamPlayers.filter((player) => player.status === 'accepted'),
    [teamPlayers]
  );
  const pendingPlayers = useMemo(
    () => teamPlayers.filter((player) => player.status === 'requested'),
    [teamPlayers]
  );
  const existingPlayerIds = useMemo(
    () => teamPlayers.map((player) => player.playerId),
    [teamPlayers]
  );
  const canInvitePlayers =
    !!user?.id &&
    currentTeam &&
    (user.id === currentTeam.ownerId || user.id === currentTeam.captainId);

  const handleInviteSuccess = () => {
    fetchTeamPlayers(teamId);
    setInviteModalVisible(false);
  };

  if (isLoading && !currentTeam) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Loading team details...</Text>
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

  if (!currentTeam) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Team not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.teamName}>
            {currentTeam.name}
          </Text>
          <View style={styles.badges}>
            <Chip icon="information" style={styles.badge}>
              {currentTeam.status.toUpperCase()}
            </Chip>
            <Chip icon="account" style={styles.badge}>
              Owner: {currentTeam.ownerName}
            </Chip>
          </View>
          {currentTeam.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {currentTeam.description}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Leadership</Text>
          <Divider style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Captain</Text>
            <Text style={styles.metaValue}>{currentTeam.captainName || 'Not assigned'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Vice Captain</Text>
            <Text style={styles.metaValue}>{currentTeam.viceCaptainName || 'Not assigned'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge">Team Members</Text>
            {canInvitePlayers && (
              <Button mode="contained" onPress={() => setInviteModalVisible(true)}>
                Invite players
              </Button>
            )}
          </View>
          <Divider style={styles.divider} />
          {acceptedPlayers.length === 0 ? (
            <Text style={styles.mutedText}>No accepted players yet.</Text>
          ) : (
            acceptedPlayers.map((player) => (
              <View key={player.playerId} style={styles.playerRow}>
                <Text variant="bodyLarge">{player.playerName}</Text>
                <Text style={styles.mutedText}>{player.role || 'All-rounder'}</Text>
              </View>
            ))
          )}

          {pendingPlayers.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.subSectionTitle}>
                Pending Invitations
              </Text>
              {pendingPlayers.map((player) => (
                <View key={player.playerId} style={styles.playerRow}>
                  <Text>{player.playerName}</Text>
                  <Text style={styles.pendingChip}>Awaiting response</Text>
                </View>
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Roster & Form</Text>
          <Divider style={styles.divider} />
          <View style={styles.statsGrid}>
            <StatCard
              title="Accepted Players"
              value={`${currentTeam.acceptedPlayers}`}
              icon="account-group"
            />
            <StatCard
              title="Total Players"
              value={`${currentTeam.totalPlayers}`}
              icon="account-multiple"
            />
            <StatCard title="Wins" value={`${currentTeam.wins}`} icon="trophy" />
            <StatCard title="Losses" value={`${currentTeam.losses}`} icon="alpha-x-box" />
            <StatCard title="Ties" value={`${currentTeam.ties}`} icon="swap-horizontal" />
            <StatCard
              title="Win Rate"
              value={`${currentTeam.winRate?.toFixed(1) || '0.0'}%`}
              icon="chart-line"
            />
          </View>
        </Card.Content>
      </Card>

      <InvitePlayersModal
        visible={inviteModalVisible}
        onDismiss={() => setInviteModalVisible(false)}
        teamId={teamId}
        existingPlayerIds={existingPlayerIds}
        onInvited={handleInviteSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerCard: {
    margin: 16,
    elevation: 3,
  },
  teamName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    color: '#444',
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  subSectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  mutedText: {
    color: '#666',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  pendingChip: {
    color: '#f57c00',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    color: '#666',
  },
  metaValue: {
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});


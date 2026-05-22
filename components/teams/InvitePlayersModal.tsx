import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Divider,
  Modal,
  Portal,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { usePlayerSearch } from '../../hooks/usePlayerSearch';
import { useTeamInvites } from '../../hooks/useTeamInvites';

interface InvitePlayersModalProps {
  teamId: string;
  visible: boolean;
  onDismiss: () => void;
  existingPlayerIds: string[];
  onInvited?: () => void;
}

export const InvitePlayersModal: React.FC<InvitePlayersModalProps> = ({
  teamId,
  visible,
  onDismiss,
  existingPlayerIds,
  onInvited,
}) => {
  const theme = useTheme();
  const { players, isLoading, error, searchPlayers, resetResults } = usePlayerSearch();
  const { sendInvite } = useTeamInvites();
  const [query, setQuery] = useState('');
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      searchPlayers('', existingPlayerIds);
    } else {
      setQuery('');
      setFeedback(null);
      resetResults();
    }
  }, [visible, existingPlayerIds, searchPlayers, resetResults]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeout = setTimeout(() => {
      searchPlayers(query, existingPlayerIds);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, visible, existingPlayerIds, searchPlayers]);

  const disabledIds = useMemo(() => new Set(existingPlayerIds), [existingPlayerIds]);

  const handleInvite = async (playerId: string) => {
    setInvitingId(playerId);
    const result = await sendInvite(teamId, playerId);
    if (result.success) {
      setFeedback('Invitation sent successfully');
      onInvited?.();
    } else {
      setFeedback('Unable to send invitation. Please try again.');
    }
    setInvitingId(null);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="titleLarge" style={styles.modalTitle}>
          Invite Players
        </Text>
        <Searchbar
          placeholder="Search by player name"
          value={query}
          onChangeText={setQuery}
          style={styles.searchbar}
        />
        <Divider />
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator />
            <Text style={styles.mutedText}>Loading players...</Text>
          </View>
        ) : players.length === 0 ? (
          <View style={styles.loadingState}>
            <Text style={styles.mutedText}>
              {query ? 'No players match your search' : 'No available players right now'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(player) => player.id}
            renderItem={({ item }) => {
              const alreadyInvited = disabledIds.has(item.id);
              const inviting = invitingId === item.id;
              return (
                <View style={styles.playerRow}>
                  <View style={styles.playerInfo}>
                    <Text variant="titleMedium">{item.displayName || item.fullName}</Text>
                    <Text style={styles.mutedText}>
                      {item.playerRole || 'All-rounder'} · Rating {item.rating?.toFixed(1) || '0.0'}
                    </Text>
                    {item.location && <Text style={styles.subText}>{item.location}</Text>}
                  </View>
                  <Button
                    mode="contained-tonal"
                    onPress={() => handleInvite(item.id)}
                    disabled={alreadyInvited || inviting}
                    loading={inviting}
                  >
                    {alreadyInvited ? 'Invited' : 'Invite'}
                  </Button>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <Divider />}
            style={styles.list}
          />
        )}

        <Button onPress={onDismiss} style={styles.closeButton}>
          Close
        </Button>
        {feedback && (
          <Text style={styles.feedbackText}>
            {feedback}
          </Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 24,
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 12,
    fontWeight: '700',
  },
  searchbar: {
    marginBottom: 12,
  },
  list: {
    maxHeight: 360,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  mutedText: {
    color: '#666',
  },
  subText: {
    color: '#888',
  },
  loadingState: {
    alignItems: 'center',
    padding: 24,
  },
  closeButton: {
    marginTop: 12,
  },
  feedbackText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#2e7d32',
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#c62828',
  },
});



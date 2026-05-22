import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../../hooks/useNotifications';
import { useTeamInvites } from '../../hooks/useTeamInvites';

/**
 * Notifications Screen
 * Lists all notifications
 */
export function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markNotificationAsRead,
    deleteNotification,
  } = useNotifications();
  const { acceptInvite, declineInvite } = useTeamInvites();

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleAcceptInvite = async (notificationId: string, teamId?: string) => {
    if (!teamId) {
      return;
    }
    const result = await acceptInvite(teamId);
    if (result.success) {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    }
  };

  const handleDeclineInvite = async (notificationId: string, teamId?: string) => {
    if (!teamId) {
      return;
    }
    const result = await declineInvite(teamId);
    if (result.success) {
      await deleteNotification(notificationId);
      fetchNotifications();
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="bodySmall" style={styles.message}>
                  {item.message}
                </Text>
                {item.type === 'team_invite' && (
                  <View style={styles.actionsRow}>
                    <Button
                      mode="contained"
                      onPress={() => handleAcceptInvite(item.id, item.entityId || undefined)}
                      style={styles.actionButton}
                    >
                      Accept
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDeclineInvite(item.id, item.entityId || undefined)}
                    >
                      Decline
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No notifications
              </Text>
            </View>
          }
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  message: {
    color: '#666',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
  },
  errorText: {
    textAlign: 'center',
    color: '#C62828',
    marginTop: 12,
  },
});


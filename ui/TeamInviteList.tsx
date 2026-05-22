import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Avatar, Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { TeamInvitation, InvitationStatus } from '../store/tournamentStore';

/**
 * Props for TeamInviteList component
 */
interface TeamInviteListProps {
  invitations: TeamInvitation[];
  onAccept?: (invitationId: string) => void;
  onDecline?: (invitationId: string) => void;
  onResend?: (invitationId: string) => void;
  onCancel?: (invitationId: string) => void;
  isLoading?: boolean;
  canManage?: boolean;
}

/**
 * TeamInviteList component
 * Manages team invitations and acceptances for tournaments
 * Displays list of invited teams with their status
 */
export const TeamInviteList: React.FC<TeamInviteListProps> = ({
  invitations,
  onAccept,
  onDecline,
  onResend,
  onCancel,
  isLoading = false,
  canManage = false,
}) => {
  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case 'accepted':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: InvitationStatus) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderInvitation = ({ item }: { item: TeamInvitation }) => {
    const canResend = item.status === 'rejected' || item.status === 'cancelled';
    const canCancel = item.status === 'pending' && canManage;

    return (
      <Card style={styles.invitationCard} mode="outlined">
        <Card.Content>
          <View style={styles.invitationHeader}>
            <View style={styles.teamInfo}>
              {item.teamLogo ? (
                <Avatar.Image size={48} source={{ uri: item.teamLogo }} />
              ) : (
                <Avatar.Text size={48} label={item.teamName.charAt(0).toUpperCase()} />
              )}
              <View style={styles.teamDetails}>
                <Text variant="titleSmall" style={styles.teamName}>
                  {item.teamName}
                </Text>
                <Text variant="bodySmall" style={styles.invitedDate}>
                  Invited: {formatDate(item.invitedAt)}
                </Text>
                {item.respondedAt && (
                  <Text variant="bodySmall" style={styles.respondedDate}>
                    Responded: {formatDate(item.respondedAt)}
                  </Text>
                )}
              </View>
            </View>
            <Chip
              mode="flat"
              compact
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) + '20' },
              ]}
              textStyle={[styles.statusChipText, { color: getStatusColor(item.status) }]}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>

          {canManage && (
            <View style={styles.actionsContainer}>
              {item.status === 'pending' && onAccept && (
                <Button
                  mode="contained"
                  compact
                  onPress={() => onAccept(item.id)}
                  style={styles.actionButton}
                >
                  Accept
                </Button>
              )}
              {item.status === 'pending' && onDecline && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => onDecline(item.id)}
                  style={styles.actionButton}
                >
                  Decline
                </Button>
              )}
              {canResend && onResend && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => onResend(item.id)}
                  style={styles.actionButton}
                >
                  Resend
                </Button>
              )}
              {canCancel && onCancel && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => onCancel(item.id)}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading invitations...
        </Text>
      </View>
    );
  }

  if (invitations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No team invitations yet
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Invite teams to join this tournament
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invitations}
      renderItem={renderInvitation}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  invitationCard: {
    marginBottom: 12,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  teamDetails: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  invitedDate: {
    color: '#666',
    fontSize: 12,
  },
  respondedDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
});


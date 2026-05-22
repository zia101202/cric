import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Text,
  Button,
  Avatar,
  Chip,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { TeamPlayer, TeamPlayerStatus } from '../store/teamStore';
import { useTeamInvites } from '../hooks/useTeamInvites';
import { useAuthStore } from '../store/authStore';

/**
 * Props for PlayerJoinRequestModal component
 */
interface PlayerJoinRequestModalProps {
  visible: boolean;
  onDismiss: () => void;
  teamId: string;
  requests: TeamPlayer[];
  onRequestUpdate?: () => void;
}

/**
 * PlayerJoinRequestModal component
 * Displays and manages player join requests for a team
 * Allows team admins to view and manage pending invitations
 */
export const PlayerJoinRequestModal: React.FC<PlayerJoinRequestModalProps> = ({
  visible,
  onDismiss,
  teamId,
  requests,
  onRequestUpdate,
}) => {
  const { user } = useAuthStore();
  const { acceptInvite, declineInvite } = useTeamInvites();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await acceptInvite(teamId, requestId);
      if (result.success && onRequestUpdate) {
        onRequestUpdate();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await declineInvite(teamId, requestId);
      if (result.success && onRequestUpdate) {
        onRequestUpdate();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: TeamPlayerStatus) => {
    switch (status) {
      case 'accepted':
        return '#4caf50';
      case 'declined':
        return '#f44336';
      case 'requested':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: TeamPlayerStatus) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'requested':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'requested');
  const otherRequests = requests.filter((r) => r.status !== 'requested');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Title
            title="Player Join Requests"
            subtitle={`${pendingRequests.length} pending`}
            right={(props) => (
              <IconButton {...props} icon="close" onPress={onDismiss} />
            )}
          />
          <Divider />
          <Card.Content>
            <ScrollView style={styles.scrollView}>
              {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    No join requests yet
                  </Text>
                </View>
              ) : (
                <>
                  {pendingRequests.length > 0 && (
                    <>
                      <Text variant="titleSmall" style={styles.sectionTitle}>
                        Pending Requests
                      </Text>
                      {pendingRequests.map((request) => (
                        <RequestItem
                          key={request.id}
                          request={request}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          processingId={processingId}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    </>
                  )}

                  {otherRequests.length > 0 && (
                    <>
                      <Text variant="titleSmall" style={styles.sectionTitle}>
                        Other Requests
                      </Text>
                      {otherRequests.map((request) => (
                        <RequestItem
                          key={request.id}
                          request={request}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          processingId={processingId}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

/**
 * RequestItem component for individual request display
 */
interface RequestItemProps {
  request: TeamPlayer;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  processingId: string | null;
  getStatusColor: (status: TeamPlayerStatus) => string;
  getStatusLabel: (status: TeamPlayerStatus) => string;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  onAccept,
  onDecline,
  processingId,
  getStatusColor,
  getStatusLabel,
}) => {
  const isProcessing = processingId === request.id;
  const canInteract = request.status === 'requested' && !isProcessing;

  return (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        {request.playerAvatar ? (
          <Avatar.Image size={40} source={{ uri: request.playerAvatar }} />
        ) : (
          <Avatar.Text size={40} label={request.playerName.charAt(0).toUpperCase()} />
        )}
        <View style={styles.requestInfo}>
          <Text variant="bodyMedium" style={styles.playerName}>
            {request.playerName}
          </Text>
          {request.role && (
            <Chip
              mode="flat"
              compact
              style={styles.roleChip}
              textStyle={styles.roleChipText}
            >
              {request.role}
            </Chip>
          )}
          <Chip
            mode="flat"
            compact
            style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + '20' }]}
            textStyle={[styles.statusChipText, { color: getStatusColor(request.status) }]}
          >
            {getStatusLabel(request.status)}
          </Chip>
        </View>
      </View>
      {canInteract && (
        <View style={styles.requestActions}>
          <Button
            mode="contained"
            compact
            onPress={() => onAccept(request.id)}
            disabled={isProcessing}
            style={styles.acceptButton}
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => onDecline(request.id)}
            disabled={isProcessing}
            style={styles.declineButton}
          >
            Decline
          </Button>
        </View>
      )}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" />
          <Text variant="bodySmall" style={styles.processingText}>
            Processing...
          </Text>
        </View>
      )}
      <Divider style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    maxHeight: '80%',
  },
  scrollView: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  requestItem: {
    paddingVertical: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginRight: 8,
  },
  roleChipText: {
    fontSize: 10,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  processingText: {
    color: '#666',
  },
  divider: {
    marginTop: 12,
  },
});


import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Card, Text, Button, IconButton } from 'react-native-paper';

/**
 * Props for PaymentFailedModal component
 */
interface PaymentFailedModalProps {
  visible: boolean;
  onDismiss: () => void;
  onRetry?: () => void;
  errorMessage?: string;
}

/**
 * PaymentFailedModal component
 * Modern bottom sheet modal UI
 * Clean messages
 * Retry/close controls
 */
export const PaymentFailedModal: React.FC<PaymentFailedModalProps> = ({
  visible,
  onDismiss,
  onRetry,
  errorMessage,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Content style={styles.content}>
            <View style={styles.iconContainer}>
              <IconButton
                icon="close-circle"
                size={64}
                iconColor="#f44336"
                style={styles.errorIcon}
              />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Payment Failed
            </Text>
            {errorMessage && (
              <Text variant="bodyMedium" style={styles.errorMessage}>
                {errorMessage}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.description}>
              Please check your wallet balance and try again. If the problem persists, contact support.
            </Text>
            <View style={styles.actionsContainer}>
              {onRetry && (
                <Button
                  mode="contained"
                  onPress={onRetry}
                  style={styles.actionButton}
                >
                  Retry
                </Button>
              )}
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.actionButton}
              >
                Close
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  errorIcon: {
    margin: 0,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#f44336',
  },
  errorMessage: {
    color: '#f44336',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});


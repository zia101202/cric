import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Card, Text, Button, IconButton } from 'react-native-paper';
import { PaymentReceipt } from '../hooks/usePayment';

/**
 * Props for PaymentSuccessModal component
 */
interface PaymentSuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
  receipt?: PaymentReceipt;
  onViewReceipt?: () => void;
}

/**
 * PaymentSuccessModal component
 * Modern bottom sheet modal UI
 * Clean messages
 * Retry/close controls
 */
export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onDismiss,
  receipt,
  onViewReceipt,
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
                icon="check-circle"
                size={64}
                iconColor="#4caf50"
                style={styles.successIcon}
              />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Payment Successful!
            </Text>
            {receipt && (
              <View style={styles.receiptInfo}>
                <View style={styles.receiptRow}>
                  <Text variant="bodyMedium" style={styles.receiptLabel}>
                    Amount:
                  </Text>
                  <Text variant="titleMedium" style={styles.receiptValue}>
                    PKR {receipt.amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text variant="bodyMedium" style={styles.receiptLabel}>
                    Transaction ID:
                  </Text>
                  <Text variant="bodySmall" style={styles.receiptValue}>
                    {receipt.transactionId.substring(0, 8)}...
                  </Text>
                </View>
                {receipt.meta?.description && (
                  <Text variant="bodySmall" style={styles.description}>
                    {receipt.meta.description}
                  </Text>
                )}
              </View>
            )}
            <View style={styles.actionsContainer}>
              {onViewReceipt && (
                <Button
                  mode="outlined"
                  onPress={onViewReceipt}
                  style={styles.actionButton}
                >
                  View Receipt
                </Button>
              )}
              <Button
                mode="contained"
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
  successIcon: {
    margin: 0,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptInfo: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    color: '#666',
  },
  receiptValue: {
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});


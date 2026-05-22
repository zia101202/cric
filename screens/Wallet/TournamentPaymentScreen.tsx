import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { usePayment } from '../../hooks/usePayment';
import { useWallet } from '../../hooks/useWallet';
import { useTournament } from '../../hooks/useTournament';
import { PaymentSuccessModal, PaymentFailedModal } from '../../ui/PaymentSuccessModal';
import { PaymentReceipt } from '../../hooks/usePayment';

/**
 * Props for TournamentPaymentScreen
 */
interface TournamentPaymentScreenProps {
  tournamentId: string;
  teamId?: string;
  onPaymentComplete?: () => void;
  onCancel?: () => void;
}

/**
 * TournamentPaymentScreen
 * Allows users to pay tournament entry fees
 * Shows transaction receipt UI
 */
export const TournamentPaymentScreen: React.FC<TournamentPaymentScreenProps> = ({
  tournamentId,
  teamId,
  onPaymentComplete,
  onCancel,
}) => {
  const { payTournamentFee } = usePayment();
  const { wallet } = useWallet();
  const { fetchTournamentById } = useTournament();
  const [tournament, setTournament] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | undefined>();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    const result = await fetchTournamentById(tournamentId);
    if (result.success && result.data) {
      setTournament(result.data);
    }
  };

  const handlePayment = async () => {
    if (!tournament) return;

    const entryFee = tournament.entryFee || 0;

    if (entryFee <= 0) {
      setErrorMessage('No entry fee required for this tournament');
      return;
    }

    if (wallet && wallet.balance < entryFee) {
      setErrorMessage('Insufficient balance. Please add money to your wallet.');
      setShowFailed(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await payTournamentFee(tournamentId, entryFee, teamId);

      if (result.success && result.receipt) {
        setReceipt(result.receipt);
        setShowSuccess(true);
        if (onPaymentComplete) {
          setTimeout(() => {
            onPaymentComplete();
          }, 2000);
        }
      } else {
        setErrorMessage(result.error || 'Payment failed');
        setShowFailed(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setShowFailed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tournament) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading tournament details...
        </Text>
      </View>
    );
  }

  const entryFee = tournament.entryFee || 0;
  const hasEnoughBalance = wallet && wallet.balance >= entryFee;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Tournament Payment" />
        <Card.Content>
          <View style={styles.tournamentInfo}>
            {tournament.logoUrl ? (
              <Avatar.Image size={64} source={{ uri: tournament.logoUrl }} />
            ) : (
              <Avatar.Text size={64} label={tournament.name.charAt(0).toUpperCase()} />
            )}
            <View style={styles.tournamentDetails}>
              <Text variant="titleLarge" style={styles.tournamentName}>
                {tournament.name}
              </Text>
              <Text variant="bodyMedium" style={styles.tournamentFormat}>
                {tournament.format} • {tournament.type}
              </Text>
            </View>
          </View>

          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text variant="titleMedium" style={styles.paymentLabel}>
                Entry Fee:
              </Text>
              <Text variant="headlineSmall" style={styles.paymentAmount}>
                PKR {entryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text variant="bodyMedium" style={styles.balanceLabel}>
                Your Balance:
              </Text>
              <Text
                variant="titleMedium"
                style={[
                  styles.balanceAmount,
                  { color: hasEnoughBalance ? '#4caf50' : '#f44336' },
                ]}
              >
                PKR {wallet?.balance.toFixed(2) || '0.00'}
              </Text>
            </View>

            {!hasEnoughBalance && (
              <Text variant="bodySmall" style={styles.insufficientBalance}>
                Insufficient balance. Please add money to your wallet.
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handlePayment}
              disabled={!hasEnoughBalance || isProcessing || entryFee <= 0}
              loading={isProcessing}
              style={styles.payButton}
            >
              {isProcessing ? 'Processing...' : 'Pay Entry Fee'}
            </Button>
            {onCancel && (
              <Button mode="outlined" onPress={onCancel} disabled={isProcessing}>
                Cancel
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <PaymentSuccessModal
        visible={showSuccess}
        onDismiss={() => {
          setShowSuccess(false);
          if (onPaymentComplete) {
            onPaymentComplete();
          }
        }}
        receipt={receipt}
      />

      <PaymentFailedModal
        visible={showFailed}
        onDismiss={() => setShowFailed(false)}
        onRetry={handlePayment}
        errorMessage={errorMessage}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  card: {
    margin: 16,
  },
  tournamentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  tournamentDetails: {
    marginLeft: 16,
    flex: 1,
  },
  tournamentName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tournamentFormat: {
    color: '#666',
  },
  paymentInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentLabel: {
    fontWeight: 'bold',
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#666',
  },
  balanceAmount: {
    fontWeight: 'bold',
  },
  insufficientBalance: {
    color: '#f44336',
    marginTop: 12,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
  },
  payButton: {
    marginBottom: 8,
  },
});


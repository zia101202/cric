import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useWithdraw } from '../../hooks/useWithdraw';
import { WithdrawForm } from '../../ui/WithdrawForm';
import { PaymentSuccessModal } from '../../ui/PaymentSuccessModal';
import { PaymentFailedModal } from '../../ui/PaymentFailedModal';

/**
 * WithdrawScreen
 * Allows users to request withdrawal with admin approval
 */
export const WithdrawScreen: React.FC = () => {
  const { requestWithdraw, getWithdrawRequests } = useWithdraw();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);

  useEffect(() => {
    loadWithdrawRequests();
  }, []);

  const loadWithdrawRequests = async () => {
    const result = await getWithdrawRequests();
    if (result.success && result.data) {
      setWithdrawRequests(result.data);
    }
  };

  const handleWithdraw = async (amount: number) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await requestWithdraw(amount, 100);

      if (result.success) {
        setShowSuccess(true);
        await loadWithdrawRequests();
      } else {
        setErrorMessage(result.error || 'Withdrawal request failed');
        setShowFailed(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Withdrawal failed');
      setShowFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <WithdrawForm
        onSubmit={handleWithdraw}
        minWithdrawal={100}
        isLoading={isLoading}
      />

      {withdrawRequests.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Withdrawal History" />
          <Card.Content>
            {withdrawRequests.map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestHeader}>
                  <Text variant="titleSmall" style={styles.requestAmount}>
                    PKR {parseFloat(request.amount).toFixed(2)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.requestStatus, { color: getStatusColor(request.status) }]}
                  >
                    {request.status.toUpperCase()}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.requestDate}>
                  {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <PaymentSuccessModal
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
      />

      <PaymentFailedModal
        visible={showFailed}
        onDismiss={() => setShowFailed(false)}
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
  card: {
    margin: 16,
    marginTop: 8,
  },
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestAmount: {
    fontWeight: 'bold',
  },
  requestStatus: {
    fontWeight: 'bold',
  },
  requestDate: {
    color: '#666',
  },
});


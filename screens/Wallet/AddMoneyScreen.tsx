import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import { PaymentSuccessModal, PaymentFailedModal } from '../../ui/PaymentSuccessModal';
import { PaymentReceipt } from '../../hooks/usePayment';

/**
 * AddMoneyScreen
 * Allows users to add money to their wallet using payment methods
 * Mock integration for now (Stripe/JazzCash/Easypaisa/PayPal)
 */
export const AddMoneyScreen: React.FC = () => {
  const { addBalance } = useWallet();
  const { createTransaction } = useTransactions();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | undefined>();
  const [errorMessage, setErrorMessage] = useState('');

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (numAmount < 100) {
      setErrorMessage('Minimum amount is PKR 100');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate payment success (90% success rate for demo)
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        // Create transaction record
        const transactionResult = await createTransaction(
          'add',
          numAmount,
          'success',
          {
            paymentMethod,
            description: `Added via ${paymentMethod}`,
          }
        );

        if (transactionResult.success && transactionResult.data) {
          // Add to wallet balance
          await addBalance(numAmount);

          const receipt: PaymentReceipt = {
            transactionId: transactionResult.data.id,
            type: 'add',
            amount: numAmount,
            status: 'success',
            meta: { paymentMethod },
          };

          setReceipt(receipt);
          setShowSuccess(true);
          setAmount('');
        } else {
          setErrorMessage('Failed to process payment');
          setShowFailed(true);
        }
      } else {
        setErrorMessage('Payment failed. Please try again.');
        setShowFailed(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setShowFailed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Add Money to Wallet" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Choose a payment method and enter the amount you want to add.
          </Text>

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Payment Method
          </Text>
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            buttons={[
              { value: 'stripe', label: 'Stripe' },
              { value: 'jazzcash', label: 'JazzCash' },
              { value: 'easypaisa', label: 'Easypaisa' },
              { value: 'paypal', label: 'PayPal' },
            ]}
            style={styles.paymentMethodButtons}
          />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Amount
          </Text>
          <TextInput
            label="Enter Amount (PKR)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
            disabled={isProcessing}
          />

          <Text variant="bodySmall" style={styles.quickAmountLabel}>
            Quick Amounts:
          </Text>
          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((value) => (
              <Chip
                key={value}
                selected={amount === value.toString()}
                onPress={() => handleQuickAmount(value)}
                style={styles.quickAmountChip}
              >
                PKR {value.toLocaleString()}
              </Chip>
            ))}
          </View>

          {errorMessage && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errorMessage}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleAddMoney}
            disabled={!amount || isProcessing || parseFloat(amount) < 100}
            loading={isProcessing}
            style={styles.addButton}
          >
            {isProcessing ? 'Processing...' : 'Add Money'}
          </Button>

          <Text variant="bodySmall" style={styles.note}>
            Note: This is a mock payment integration. In production, this would connect to actual payment gateways.
          </Text>
        </Card.Content>
      </Card>

      <PaymentSuccessModal
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        receipt={receipt}
      />

      <PaymentFailedModal
        visible={showFailed}
        onDismiss={() => setShowFailed(false)}
        onRetry={handleAddMoney}
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
  },
  description: {
    marginBottom: 24,
    color: '#666',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  paymentMethodButtons: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  quickAmountLabel: {
    marginTop: 8,
    marginBottom: 8,
    color: '#666',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickAmountChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  note: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});


import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useWallet } from '../hooks/useWallet';

/**
 * Props for WithdrawForm component
 */
interface WithdrawFormProps {
  onSubmit: (amount: number) => void;
  onCancel?: () => void;
  minWithdrawal?: number;
  isLoading?: boolean;
}

/**
 * WithdrawForm component
 * Amount input with validation messages
 * Submit button
 */
export const WithdrawForm: React.FC<WithdrawFormProps> = ({
  onSubmit,
  onCancel,
  minWithdrawal = 100,
  isLoading = false,
}) => {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    
    if (!value || isNaN(numValue)) {
      setError('Please enter a valid amount');
      return false;
    }

    if (numValue < minWithdrawal) {
      setError(`Minimum withdrawal amount is PKR ${minWithdrawal}`);
      return false;
    }

    if (wallet && numValue > wallet.balance) {
      setError('Insufficient balance');
      return false;
    }

    setError('');
    return true;
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return; // Only allow one decimal point
    }
    if (parts[1] && parts[1].length > 2) {
      return; // Only allow 2 decimal places
    }
    setAmount(cleaned);
    if (cleaned) {
      validateAmount(cleaned);
    } else {
      setError('');
    }
  };

  const handleSubmit = () => {
    if (validateAmount(amount)) {
      onSubmit(parseFloat(amount));
    }
  };

  const availableBalance = wallet?.balance || 0;
  const isFormValid = amount && !error && parseFloat(amount) >= minWithdrawal && parseFloat(amount) <= availableBalance;

  return (
    <Card>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Request Withdrawal
        </Text>

        <View style={styles.balanceInfo}>
          <Text variant="bodyMedium" style={styles.balanceLabel}>
            Available Balance:
          </Text>
          <Text variant="titleLarge" style={styles.balanceAmount}>
            PKR {availableBalance.toFixed(2)}
          </Text>
        </View>

        <TextInput
          label="Withdrawal Amount"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="currency-usd" />}
          disabled={isLoading}
          error={!!error}
        />
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
        <HelperText type="info" visible={!error && !!amount}>
          Minimum withdrawal: PKR {minWithdrawal}
        </HelperText>

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
            loading={isLoading}
            style={styles.submitButton}
          >
            Request Withdrawal
          </Button>
          {onCancel && (
            <Button mode="outlined" onPress={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  balanceInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  input: {
    marginBottom: 4,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
});


import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { useWallet } from '../hooks/useWallet';

/**
 * Props for WalletCard component
 */
interface WalletCardProps {
  onAddMoney?: () => void;
  onRefresh?: () => void;
}

/**
 * WalletCard component
 * Shows current balance with animated count
 * Includes refresh button
 */
export const WalletCard: React.FC<WalletCardProps> = ({
  onAddMoney,
  onRefresh,
}) => {
  const { wallet, getWalletBalance, isLoading } = useWallet();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wallet?.balance !== undefined) {
      Animated.timing(animatedValue, {
        toValue: wallet.balance,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [wallet?.balance, animatedValue]);

  const handleRefresh = async () => {
    await getWalletBalance();
    if (onRefresh) {
      onRefresh();
    }
  };

  const displayBalance = animatedValue.interpolate({
    inputRange: [0, 1000000],
    outputRange: [0, 1000000],
  });

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.balanceContainer}>
            <Text variant="labelMedium" style={styles.label}>
              Wallet Balance
            </Text>
            {isLoading ? (
              <ActivityIndicator size="large" style={styles.loader} />
            ) : (
              <Animated.Text style={[styles.balance, { opacity: 1 }]}>
                PKR {wallet?.balance?.toFixed(2) || '0.00'}
              </Animated.Text>
            )}
          </View>
          <IconButton
            icon="refresh"
            size={24}
            onPress={handleRefresh}
            disabled={isLoading}
          />
        </View>
        {onAddMoney && (
          <View style={styles.actionsContainer}>
            <IconButton
              icon="plus-circle"
              size={32}
              iconColor="#4caf50"
              onPress={onAddMoney}
              style={styles.addButton}
            />
            <Text variant="bodySmall" style={styles.addButtonText}>
              Add Money
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceContainer: {
    flex: 1,
  },
  label: {
    color: '#666',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  loader: {
    marginVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    margin: 0,
  },
  addButtonText: {
    color: '#1976d2',
    marginLeft: -8,
  },
});


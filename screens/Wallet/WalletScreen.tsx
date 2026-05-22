import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Button, FAB, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { WalletCard } from '../../ui/WalletCard';
import { TransactionItem } from '../../ui/TransactionItem';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import { Transaction } from '../../store/transactionStore';

/**
 * Wallet Screen
 * Shows wallet balance and recent transactions
 * Full implementation with real-time updates
 */
export function WalletScreen() {
  const navigation = useNavigation();
  const { wallet, getWalletBalance } = useWallet();
  const { transactions, getUserTransactions } = useTransactions();

  useEffect(() => {
    getWalletBalance();
    getUserTransactions(false);
  }, []);

  const handleAddMoney = () => {
    navigation.navigate('AddMoney' as never);
  };

  const handleViewTransactions = () => {
    navigation.navigate('Transactions' as never);
  };

  const handleWithdraw = () => {
    navigation.navigate('Withdraw' as never);
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView>
        <WalletCard onAddMoney={handleAddMoney} />

        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            icon="arrow-down-circle"
            onPress={handleWithdraw}
            style={styles.actionButton}
          >
            Withdraw
          </Button>
          <Button
            mode="outlined"
            icon="history"
            onPress={handleViewTransactions}
            style={styles.actionButton}
          >
            View All
          </Button>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Transactions
            </Text>
            {transactions.length > 5 && (
              <Button
                mode="text"
                compact
                onPress={handleViewTransactions}
              >
                See All
              </Button>
            )}
          </View>
          <Divider />

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No transactions yet
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Start by adding money to your wallet
              </Text>
            </View>
          ) : (
            <FlatList
              data={recentTransactions}
              renderItem={({ item }: { item: Transaction }) => (
                <TransactionItem transaction={item} />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddMoney}
        label="Add Money"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  transactionsSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});


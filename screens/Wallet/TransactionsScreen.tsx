import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  SegmentedButtons,
  Chip,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionItem } from '../../ui/TransactionItem';
import { Transaction, TransactionType, TransactionStatus } from '../../store/transactionStore';

/**
 * TransactionsScreen
 * Shows full transaction history with filters
 */
export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    filters,
    pagination,
    getUserTransactions,
    filterTransactions,
  } = useTransactions();
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    await getUserTransactions(false);
  };

  const loadMore = async () => {
    if (pagination.hasMore && !pagination.isFetchingMore) {
      await getUserTransactions(true);
    }
  };

  const handleTypeFilter = (type: TransactionType | 'all') => {
    setSelectedType(type);
    filterTransactions({
      type: type === 'all' ? undefined : type,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    });
  };

  const handleStatusFilter = (status: TransactionStatus | 'all') => {
    setSelectedStatus(status);
    filterTransactions({
      type: selectedType === 'all' ? undefined : selectedType,
      status: status === 'all' ? undefined : status,
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} />
  );

  const renderFooter = () => {
    if (!pagination.isFetchingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.filterTitle}>
            Filter by Type
          </Text>
          <View style={styles.chipContainer}>
            {(['all', 'add', 'withdraw', 'fee', 'prize', 'refund', 'purchase'] as const).map(
              (type) => (
                <Chip
                  key={type}
                  selected={selectedType === type}
                  onPress={() => handleTypeFilter(type)}
                  style={styles.filterChip}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Chip>
              )
            )}
          </View>

          <Text variant="titleSmall" style={styles.filterTitle}>
            Filter by Status
          </Text>
          <View style={styles.chipContainer}>
            {(['all', 'pending', 'success', 'failed'] as const).map((status) => (
              <Chip
                key={status}
                selected={selectedStatus === status}
                onPress={() => handleStatusFilter(status)}
                style={styles.filterChip}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No transactions found
            </Text>
          </View>
        }
        refreshing={false}
        onRefresh={loadTransactions}
      />

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={loadTransactions}
        label="Refresh"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersCard: {
    margin: 16,
    marginBottom: 8,
  },
  filterTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 80,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});


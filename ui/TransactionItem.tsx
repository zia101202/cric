import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar } from 'react-native-paper';
import { Transaction, TransactionType, TransactionStatus } from '../store/transactionStore';

/**
 * Props for TransactionItem component
 */
interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

/**
 * TransactionItem component
 * Icons: add, withdraw, prize, fee
 * Status badge (success/error/pending)
 * Clean transaction detail layout
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'add':
        return 'plus-circle';
      case 'withdraw':
        return 'minus-circle';
      case 'prize':
        return 'trophy';
      case 'fee':
        return 'credit-card';
      case 'refund':
        return 'arrow-left-circle';
      case 'purchase':
        return 'shopping';
      default:
        return 'circle';
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'add':
      case 'prize':
      case 'refund':
        return '#4caf50';
      case 'withdraw':
      case 'fee':
      case 'purchase':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'success':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'add':
        return 'Added';
      case 'withdraw':
        return 'Withdrawn';
      case 'prize':
        return 'Prize';
      case 'fee':
        return 'Fee';
      case 'refund':
        return 'Refund';
      case 'purchase':
        return 'Purchase';
      default:
        return 'Transaction';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPositive = transaction.type === 'add' || transaction.type === 'prize' || transaction.type === 'refund';
  const amountColor = isPositive ? '#4caf50' : '#f44336';
  const amountPrefix = isPositive ? '+' : '-';

  return (
    <TouchableOpacity onPress={() => onPress?.(transaction)} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.container}>
            <Avatar.Icon
              size={48}
              icon={getTransactionIcon(transaction.type)}
              style={[styles.icon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}
              color={getTransactionColor(transaction.type)}
            />
            <View style={styles.details}>
              <View style={styles.headerRow}>
                <Text variant="titleSmall" style={styles.type}>
                  {getTypeLabel(transaction.type)}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[styles.amount, { color: amountColor }]}
                >
                  {amountPrefix}PKR {Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
              {transaction.meta?.description && (
                <Text variant="bodySmall" style={styles.description} numberOfLines={1}>
                  {transaction.meta.description}
                </Text>
              )}
              <View style={styles.footerRow}>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(transaction.createdAt)}
                </Text>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(transaction.status) + '20' },
                  ]}
                  textStyle={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) },
                  ]}
                >
                  {transaction.status}
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontWeight: 'bold',
    flex: 1,
  },
  amount: {
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#666',
    fontSize: 11,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});


import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  List,
  Chip,
  ActivityIndicator,
  Button,
  SegmentedButtons,
} from 'react-native-paper';
import { useBooking, VenueBooking, BookingStatus } from '../../hooks/useBooking';

/**
 * MyBookingsScreen
 * Displays user's venue bookings with status and cancellation options
 */
export const MyBookingsScreen: React.FC = () => {
  const { loading, error, getUserBookings, cancelBooking } = useBooking();
  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    const result = await getUserBookings(statusFilter);
    if (result.success && result.data) {
      setBookings(result.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancel = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelBooking(bookingId);
            if (result.success) {
              Alert.alert('Success', 'Booking cancelled successfully');
              await loadBookings();
            } else {
              Alert.alert('Error', result.error || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      case 'cancelled':
        return '#9E9E9E';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>My Bookings</Title>
        <Paragraph style={styles.headerSubtitle}>
          View and manage your venue bookings
        </Paragraph>
      </Surface>

      <SegmentedButtons
        value={statusFilter || 'all'}
        onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : (value as BookingStatus))}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'completed', label: 'Completed' },
        ]}
        style={styles.segmentedButtons}
      />

      {loading && bookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Loading bookings...</Paragraph>
        </View>
      ) : bookings.length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <Paragraph style={styles.emptyText}>No bookings found</Paragraph>
        </Surface>
      ) : (
        bookings.map((booking) => (
          <Surface key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Title style={styles.bookingTitle}>Booking #{booking.id.substring(0, 8)}</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
                textStyle={styles.statusText}
              >
                {booking.status}
              </Chip>
            </View>
            <List.Item
              title="Date"
              description={formatDate(booking.bookingDate)}
              left={() => <List.Icon icon="calendar" />}
            />
            <List.Item
              title="Time"
              description={`${formatTime(booking.timeslotStart)} - ${formatTime(booking.timeslotEnd)}`}
              left={() => <List.Icon icon="clock" />}
            />
            {booking.amount > 0 && (
              <List.Item
                title="Amount"
                description={`₹${booking.amount}`}
                left={() => <List.Icon icon="currency-inr" />}
              />
            )}
            <List.Item
              title="Payment Status"
              description={booking.paymentStatus}
              left={() => <List.Icon icon="credit-card" />}
            />
            {(booking.status === 'pending' || booking.status === 'approved') && (
              <Button
                mode="outlined"
                onPress={() => handleCancel(booking.id)}
                style={styles.cancelButton}
                textColor="#F44336"
              >
                Cancel Booking
              </Button>
            )}
          </Surface>
        ))
      )}

      {error && (
        <Surface style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Surface>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  bookingCard: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    borderColor: '#F44336',
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
});


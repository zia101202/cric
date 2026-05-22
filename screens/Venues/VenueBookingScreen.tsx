import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useBooking, BookingRequest } from '../../hooks/useBooking';
import { useVenues } from '../../hooks/useVenues';
import { AvailabilityCalendar } from '../../ui/AvailabilityCalendar';
import { AvailabilitySlot } from '../../hooks/useVenues';
import { useRoute, useNavigation } from '@react-navigation/native';

/**
 * VenueBookingScreen
 * Allows users to book a venue for a specific date and time slot
 */
export const VenueBookingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore
  const venueId = route.params?.venueId;
  const { loading: venueLoading, getVenue, getVenueAvailability } = useVenues();
  const { loading: bookingLoading, error, createBooking } = useBooking();
  const [venue, setVenue] = useState<any>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [dateFrom, setDateFrom] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (venueId) {
      loadVenue();
      loadAvailability();
    }
  }, [venueId, dateFrom, dateTo]);

  const loadVenue = async () => {
    if (!venueId) return;
    const result = await getVenue(venueId);
    if (result.success && result.data) {
      setVenue(result.data);
    }
  };

  const loadAvailability = async () => {
    if (!venueId) return;
    const result = await getVenueAvailability(venueId, dateFrom, dateTo);
    if (result.success && result.data) {
      setSlots(result.data);
    }
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handleBook = async () => {
    if (!selectedSlot || !venueId) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const bookingRequest: BookingRequest = {
      venueId,
      bookingDate: selectedSlot.date,
      timeslotStart: selectedSlot.timeslotStart,
      timeslotEnd: selectedSlot.timeslotEnd,
    };

    const result = await createBooking(bookingRequest);
    if (result.success) {
      Alert.alert('Success', 'Booking request created successfully!', [
        { text: 'OK', onPress: () => {
          // @ts-ignore
          navigation.goBack();
        }},
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to create booking');
    }
  };

  if (venueLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading venue...</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {venue && (
        <Surface style={styles.venueInfo}>
          <Title style={styles.venueName}>{venue.name}</Title>
          <Paragraph style={styles.venueLocation}>{venue.location}</Paragraph>
          {venue.address && <Paragraph style={styles.venueAddress}>{venue.address}</Paragraph>}
        </Surface>
      )}

      <Surface style={styles.section}>
        <Title style={styles.sectionTitle}>Select Date & Time</Title>
        <Paragraph style={styles.sectionDescription}>
          Choose an available time slot for your booking
        </Paragraph>
        <AvailabilityCalendar
          slots={slots}
          onSlotSelect={handleSlotSelect}
          selectedSlotId={selectedSlot?.id}
        />
      </Surface>

      {selectedSlot && (
        <Surface style={styles.bookingSummary}>
          <Title style={styles.summaryTitle}>Booking Summary</Title>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Date:</Paragraph>
            <Paragraph style={styles.summaryValue}>
              {new Date(selectedSlot.date).toLocaleDateString()}
            </Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Time:</Paragraph>
            <Paragraph style={styles.summaryValue}>
              {selectedSlot.timeslotStart.substring(0, 5)} - {selectedSlot.timeslotEnd.substring(0, 5)}
            </Paragraph>
          </View>
          {selectedSlot.price && (
            <View style={styles.summaryRow}>
              <Paragraph style={styles.summaryLabel}>Amount:</Paragraph>
              <Paragraph style={styles.summaryValue}>₹{selectedSlot.price}</Paragraph>
            </View>
          )}
          <Divider style={styles.divider} />
          <Button
            mode="contained"
            onPress={handleBook}
            loading={bookingLoading}
            style={styles.bookButton}
            accessibilityLabel="Confirm booking"
          >
            Confirm Booking
          </Button>
        </Surface>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  venueInfo: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  bookingSummary: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  bookButton: {
    marginTop: 8,
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


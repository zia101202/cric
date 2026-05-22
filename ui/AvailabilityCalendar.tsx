import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { AvailabilitySlot } from '../hooks/useVenues';

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  onSlotSelect?: (slot: AvailabilitySlot) => void;
  selectedSlotId?: string;
}

/**
 * AvailabilityCalendar component
 * Displays venue availability slots in a calendar-like view
 */
export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  selectedDate,
  onDateSelect,
  onSlotSelect,
  selectedSlotId,
}) => {
  const groupedByDate = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, AvailabilitySlot[]>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  return (
    <ScrollView style={styles.container}>
      {Object.keys(groupedByDate).length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <Paragraph style={styles.emptyText}>No availability slots found</Paragraph>
        </Surface>
      ) : (
        Object.entries(groupedByDate).map(([date, dateSlots]) => (
          <Surface key={date} style={styles.dateSection}>
            <Title style={styles.dateTitle}>{formatDate(date)}</Title>
            <View style={styles.slotsContainer}>
              {dateSlots.map((slot) => (
                <Chip
                  key={slot.id}
                  style={[
                    styles.slotChip,
                    selectedSlotId === slot.id && styles.selectedSlot,
                    slot.status === 'booked' && styles.bookedSlot,
                    slot.status === 'blocked' && styles.blockedSlot,
                  ]}
                  textStyle={[
                    styles.slotText,
                    selectedSlotId === slot.id && styles.selectedSlotText,
                    slot.status === 'booked' && styles.bookedSlotText,
                    slot.status === 'blocked' && styles.blockedSlotText,
                  ]}
                  onPress={() => {
                    if (slot.status === 'available' && onSlotSelect) {
                      onSlotSelect(slot);
                    }
                  }}
                  disabled={slot.status !== 'available'}
                  accessibilityLabel={`Time slot: ${formatTime(slot.timeslotStart)} - ${formatTime(slot.timeslotEnd)}, ${slot.status}`}
                >
                  {formatTime(slot.timeslotStart)} - {formatTime(slot.timeslotEnd)}
                  {slot.price && ` • ₹${slot.price}`}
                </Chip>
              ))}
            </View>
          </Surface>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  dateSection: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 36,
    backgroundColor: '#E8F5E9',
  },
  selectedSlot: {
    backgroundColor: '#4CAF50',
  },
  bookedSlot: {
    backgroundColor: '#FFEBEE',
  },
  blockedSlot: {
    backgroundColor: '#F5F5F5',
  },
  slotText: {
    fontSize: 13,
    color: '#424242',
  },
  selectedSlotText: {
    color: '#fff',
  },
  bookedSlotText: {
    color: '#C62828',
  },
  blockedSlotText: {
    color: '#9E9E9E',
  },
});


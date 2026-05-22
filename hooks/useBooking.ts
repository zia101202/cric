import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';
import { useWallet } from './useWallet';
import { useTransactions } from './useTransactions';

/**
 * Booking status
 */
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

/**
 * Venue booking interface
 */
export interface VenueBooking {
  id: string;
  venueId: string;
  requesterId: string;
  teamId: string | null;
  bookingDate: string;
  timeslotStart: string;
  timeslotEnd: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking request data
 */
export interface BookingRequest {
  venueId: string;
  bookingDate: string;
  timeslotStart: string;
  timeslotEnd: string;
  teamId?: string;
}

/**
 * Custom hook for venue booking operations
 * Handles booking creation, payment, cancellation, and status management
 */
export const useBooking = () => {
  const { user } = useAuthStore();
  const { deductBalance } = useWallet();
  const { createTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create booking request
   */
  const createBooking = useCallback(
    async (request: BookingRequest) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        // Check availability
        const { data: availability, error: availError } = await supabase
          .from('venue_availability')
          .select('*')
          .eq('venue_id', request.venueId)
          .eq('date', request.bookingDate)
          .eq('timeslot_start', request.timeslotStart)
          .eq('timeslot_end', request.timeslotEnd)
          .eq('status', 'available')
          .single();

        if (availError || !availability) {
          return { success: false, error: 'Time slot not available' };
        }

        // Get venue price
        const price = availability.price ? parseFloat(availability.price) : 0;

        // Create booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('venue_bookings')
          .insert({
            venue_id: request.venueId,
            requester_id: user.id,
            team_id: request.teamId || null,
            booking_date: request.bookingDate,
            timeslot_start: request.timeslotStart,
            timeslot_end: request.timeslotEnd,
            amount: price,
            status: 'pending',
            payment_status: 'pending',
          })
          .select()
          .single();

        if (bookingError) {
          throw bookingError;
        }

        // If auto-approve or payment required, handle payment
        if (price > 0) {
          // Deduct from wallet
          const deductResult = await deductBalance(price);
          if (!deductResult.success) {
            // Cancel booking if payment fails
            await supabase.from('venue_bookings').delete().eq('id', bookingData.id);
            return { success: false, error: 'Insufficient balance' };
          }

          // Create transaction
          await createTransaction('venue_booking', price, 'success', {
            bookingId: bookingData.id,
            venueId: request.venueId,
          });

          // Update booking payment status
          await supabase
            .from('venue_bookings')
            .update({ payment_status: 'paid' })
            .eq('id', bookingData.id);
        }

        // Mark availability as booked
        await supabase
          .from('venue_availability')
          .update({ status: 'booked' })
          .eq('id', availability.id);

        const booking: VenueBooking = {
          id: bookingData.id,
          venueId: bookingData.venue_id,
          requesterId: bookingData.requester_id,
          teamId: bookingData.team_id,
          bookingDate: bookingData.booking_date,
          timeslotStart: bookingData.timeslot_start,
          timeslotEnd: bookingData.timeslot_end,
          amount: parseFloat(bookingData.amount),
          status: bookingData.status as BookingStatus,
          paymentStatus: bookingData.payment_status as PaymentStatus,
          createdAt: bookingData.created_at,
          updatedAt: bookingData.updated_at,
        };

        return { success: true, data: booking };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user, deductBalance, createTransaction]
  );

  /**
   * Get user's bookings
   */
  const getUserBookings = useCallback(
    async (status?: BookingStatus) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('venue_bookings')
          .select('*, venues(*)')
          .eq('requester_id', user.id);

        if (status) {
          query = query.eq('status', status);
        }

        query = query.order('booking_date', { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        const bookings: VenueBooking[] =
          data?.map((item: any) => ({
            id: item.id,
            venueId: item.venue_id,
            requesterId: item.requester_id,
            teamId: item.team_id,
            bookingDate: item.booking_date,
            timeslotStart: item.timeslot_start,
            timeslotEnd: item.timeslot_end,
            amount: parseFloat(item.amount),
            status: item.status as BookingStatus,
            paymentStatus: item.payment_status as PaymentStatus,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })) || [];

        return { success: true, data: bookings };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Cancel booking
   */
  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        // Get booking
        const { data: booking, error: fetchError } = await supabase
          .from('venue_bookings')
          .select('*')
          .eq('id', bookingId)
          .eq('requester_id', user.id)
          .single();

        if (fetchError || !booking) {
          return { success: false, error: 'Booking not found' };
        }

        if (booking.status === 'cancelled' || booking.status === 'completed') {
          return { success: false, error: 'Booking cannot be cancelled' };
        }

        // Update booking status
        const { error: updateError } = await supabase
          .from('venue_bookings')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (updateError) {
          throw updateError;
        }

        // Refund if paid
        if (booking.payment_status === 'paid') {
          // Refund logic would go here
          await supabase
            .from('venue_bookings')
            .update({ payment_status: 'refunded' })
            .eq('id', bookingId);
        }

        // Free up availability slot
        await supabase
          .from('venue_availability')
          .update({ status: 'available' })
          .eq('venue_id', booking.venue_id)
          .eq('date', booking.booking_date)
          .eq('timeslot_start', booking.timeslot_start)
          .eq('timeslot_end', booking.timeslot_end);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Approve booking (venue owner/admin)
   */
  const approveBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('venue_bookings')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reject booking (venue owner/admin)
   */
  const rejectBooking = useCallback(
    async (bookingId: string, reason?: string) => {
      setLoading(true);
      setError(null);

      try {
        // Get booking to free up slot
        const { data: booking } = await supabase
          .from('venue_bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        const { error: updateError } = await supabase
          .from('venue_bookings')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (updateError) {
          throw updateError;
        }

        // Free up availability slot
        if (booking) {
          await supabase
            .from('venue_availability')
            .update({ status: 'available' })
            .eq('venue_id', booking.venue_id)
            .eq('date', booking.booking_date)
            .eq('timeslot_start', booking.timeslot_start)
            .eq('timeslot_end', booking.timeslot_end);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reject booking';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createBooking,
    getUserBookings,
    cancelBooking,
    approveBooking,
    rejectBooking,
  };
};


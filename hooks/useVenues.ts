import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Venue interface
 */
export interface Venue {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  capacity: number | null;
  address: string | null;
  amenities: string[] | null;
  ownerId?: string | null;
  createdAt: string;
}

/**
 * Venue availability slot
 */
export interface AvailabilitySlot {
  id: string;
  venueId: string;
  date: string;
  timeslotStart: string;
  timeslotEnd: string;
  status: 'available' | 'booked' | 'blocked';
  price: number | null;
}

/**
 * Venue search filters
 */
export interface VenueFilters {
  query?: string;
  location?: string;
  minCapacity?: number;
  maxPrice?: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

/**
 * Custom hook for venue operations
 * Handles venue search, listing, and availability checking
 */
export const useVenues = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search venues with filters
   */
  const searchVenues = useCallback(async (filters: VenueFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('venues').select('*');

      // Apply text search
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,location.ilike.%${filters.query}%,address.ilike.%${filters.query}%`);
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply capacity filter
      if (filters.minCapacity) {
        query = query.gte('capacity', filters.minCapacity);
      }

      // Geospatial search (simplified - would use PostGIS in production)
      if (filters.latitude && filters.longitude && filters.radius) {
        // Simple bounding box approximation
        const latDelta = filters.radius / 111; // 1 degree latitude ≈ 111 km
        const lngDelta = filters.radius / (111 * Math.cos((filters.latitude * Math.PI) / 180));

        query = query
          .gte('latitude', filters.latitude - latDelta)
          .lte('latitude', filters.latitude + latDelta)
          .gte('longitude', filters.longitude - lngDelta)
          .lte('longitude', filters.longitude + lngDelta);
      }

      const { data, error: fetchError } = await query.order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const venues: Venue[] =
        data?.map((item: any) => ({
          id: item.id,
          name: item.name,
          location: item.location || '',
          latitude: item.latitude ? parseFloat(item.latitude) : null,
          longitude: item.longitude ? parseFloat(item.longitude) : null,
          images: item.images || [],
          capacity: item.capacity,
          address: item.address,
          amenities: item.amenities || [],
          ownerId: item.owner_id,
          createdAt: item.created_at,
        })) || [];

      return { success: true, data: venues };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search venues';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get venue by ID
   */
  const getVenue = useCallback(async (venueId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const venue: Venue = {
        id: data.id,
        name: data.name,
        location: data.location || '',
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        images: data.images || [],
        capacity: data.capacity,
        address: data.address,
        amenities: data.amenities || [],
        ownerId: data.owner_id,
        createdAt: data.created_at,
      };

      return { success: true, data: venue };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch venue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get availability for a venue
   */
  const getVenueAvailability = useCallback(
    async (venueId: string, dateFrom: string, dateTo: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('venue_availability')
          .select('*')
          .eq('venue_id', venueId)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: true })
          .order('timeslot_start', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        const slots: AvailabilitySlot[] =
          data?.map((item: any) => ({
            id: item.id,
            venueId: item.venue_id,
            date: item.date,
            timeslotStart: item.timeslot_start,
            timeslotEnd: item.timeslot_end,
            status: item.status as 'available' | 'booked' | 'blocked',
            price: item.price ? parseFloat(item.price) : null,
          })) || [];

        return { success: true, data: slots };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch availability';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Create venue (for venue owners)
   */
  const createVenue = useCallback(
    async (venueData: Omit<Venue, 'id' | 'createdAt' | 'ownerId'>) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: createError } = await supabase
          .from('venues')
          .insert({
            name: venueData.name,
            location: venueData.location,
            latitude: venueData.latitude,
            longitude: venueData.longitude,
            images: venueData.images,
            capacity: venueData.capacity,
            address: venueData.address,
            amenities: venueData.amenities,
            owner_id: user.id,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        const venue: Venue = {
          id: data.id,
          name: data.name,
          location: data.location || '',
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,
          images: data.images || [],
          capacity: data.capacity,
          address: data.address,
          amenities: data.amenities || [],
          ownerId: data.owner_id,
          createdAt: data.created_at,
        };

        return { success: true, data: venue };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create venue';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    loading,
    error,
    searchVenues,
    getVenue,
    getVenueAvailability,
    createVenue,
  };
};


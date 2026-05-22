import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Discovery filters
 */
export interface DiscoveryFilters {
  query?: string;
  location?: string;
  format?: string;
  skillLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  minFee?: number;
  maxFee?: number;
}

/**
 * Discovery result item
 */
export interface DiscoveryItem {
  id: string;
  type: 'tournament' | 'player' | 'team';
  title: string;
  description?: string;
  location?: string;
  rating?: number;
  metadata?: Record<string, any>;
}

/**
 * Custom hook for advanced search and discovery
 * Handles geospatial search, filters, and pagination
 */
export const useDiscovery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Discover tournaments
   */
  const discoverTournaments = useCallback(
    async (filters: DiscoveryFilters = {}, page: number = 0, pageSize: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('tournaments').select('*');

        // Text search
        if (filters.query) {
          query = query.or(
            `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`
          );
        }

        // Location filter
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        // Format filter
        if (filters.format) {
          query = query.eq('format', filters.format);
        }

        // Date range
        if (filters.dateFrom) {
          query = query.gte('start_date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('end_date', filters.dateTo);
        }

        // Fee range
        if (filters.minFee !== undefined) {
          query = query.gte('entry_fee', filters.minFee);
        }
        if (filters.maxFee !== undefined) {
          query = query.lte('entry_fee', filters.maxFee);
        }

        // Geospatial search (simplified - would use PostGIS in production)
        if (filters.latitude && filters.longitude && filters.radius) {
          const latDelta = filters.radius / 111;
          const lngDelta = filters.radius / (111 * Math.cos((filters.latitude * Math.PI) / 180));
          // Note: This assumes latitude/longitude columns exist in tournaments table
          // query = query
          //   .gte('latitude', filters.latitude - latDelta)
          //   .lte('latitude', filters.latitude + latDelta)
          //   .gte('longitude', filters.longitude - lngDelta)
          //   .lte('longitude', filters.longitude + lngDelta);
        }

        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        const items: DiscoveryItem[] =
          data?.map((item: any) => ({
            id: item.id,
            type: 'tournament',
            title: item.name,
            description: item.description,
            location: item.location,
            rating: item.rating,
            metadata: item,
          })) || [];

        return { success: true, data: items, hasMore: (data?.length || 0) === pageSize };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to discover tournaments';
        setError(errorMessage);
        return { success: false, error: errorMessage, data: [], hasMore: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Discover players
   */
  const discoverPlayers = useCallback(
    async (filters: DiscoveryFilters = {}, page: number = 0, pageSize: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('user_profiles').select('*');

        // Text search
        if (filters.query) {
          query = query.or(
            `full_name.ilike.%${filters.query}%,display_name.ilike.%${filters.query}%`
          );
        }

        // Location filter
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        // Skill level filter (based on rating)
        if (filters.skillLevel) {
          const ratingRanges: Record<string, { min: number; max: number }> = {
            beginner: { min: 0, max: 30 },
            intermediate: { min: 30, max: 60 },
            advanced: { min: 60, max: 100 },
          };
          const range = ratingRanges[filters.skillLevel];
          if (range) {
            query = query.gte('rating', range.min).lte('rating', range.max);
          }
        }

        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('rating', { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        const items: DiscoveryItem[] =
          data?.map((item: any) => ({
            id: item.id,
            type: 'player',
            title: item.full_name || item.display_name || 'Unknown',
            description: item.bio,
            location: item.location,
            rating: item.rating || 0,
            metadata: item,
          })) || [];

        return { success: true, data: items, hasMore: (data?.length || 0) === pageSize };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to discover players';
        setError(errorMessage);
        return { success: false, error: errorMessage, data: [], hasMore: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Discover teams
   */
  const discoverTeams = useCallback(
    async (filters: DiscoveryFilters = {}, page: number = 0, pageSize: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('teams').select('*');

        // Text search
        if (filters.query) {
          query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
        }

        // Location filter
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('rating', { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        const items: DiscoveryItem[] =
          data?.map((item: any) => ({
            id: item.id,
            type: 'team',
            title: item.name,
            description: item.description,
            location: item.location,
            rating: item.rating,
            metadata: item,
          })) || [];

        return { success: true, data: items, hasMore: (data?.length || 0) === pageSize };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to discover teams';
        setError(errorMessage);
        return { success: false, error: errorMessage, data: [], hasMore: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    discoverTournaments,
    discoverPlayers,
    discoverTeams,
  };
};


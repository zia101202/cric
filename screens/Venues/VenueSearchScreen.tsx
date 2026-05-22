import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Searchbar,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useVenues, Venue, VenueFilters } from '../../hooks/useVenues';
import { VenueCard } from '../../ui/VenueCard';
import { useNavigation } from '@react-navigation/native';

/**
 * VenueSearchScreen
 * Allows users to search and discover venues
 */
export const VenueSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { loading, error, searchVenues } = useVenues();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<VenueFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVenues();
  }, [filters]);

  const loadVenues = async () => {
    const result = await searchVenues(filters);
    if (result.success && result.data) {
      setVenues(result.data);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    const result = await searchVenues(newFilters);
    if (result.success && result.data) {
      setVenues(result.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => {
    // @ts-ignore
    navigation.navigate('VenueDetail', { venueId: venue.id });
  };

  const handleBook = (venue: Venue) => {
    // @ts-ignore
    navigation.navigate('VenueBooking', { venueId: venue.id });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Find Venues</Title>
        <Paragraph style={styles.headerSubtitle}>
          Search for cricket grounds and book your next match
        </Paragraph>
      </Surface>

      <Searchbar
        placeholder="Search venues..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        accessibilityLabel="Search venues"
      />

      {loading && venues.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Searching venues...</Paragraph>
        </View>
      ) : venues.length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <Paragraph style={styles.emptyText}>
            {searchQuery ? 'No venues found matching your search' : 'No venues available'}
          </Paragraph>
        </Surface>
      ) : (
        venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onPress={() => handleVenuePress(venue)}
            onBook={() => handleBook(venue)}
          />
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
  searchbar: {
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


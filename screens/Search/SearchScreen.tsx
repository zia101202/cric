import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Searchbar, Card, Text, Chip, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useDiscovery } from '../../hooks/useDiscovery';
import { FilterChips } from '../../ui/FilterChips';
import { TeamCard } from '../../ui/TeamCard';
import { TournamentCard } from '../../ui/TournamentCard';

/**
 * Search type
 */
type SearchType = 'all' | 'tournaments' | 'teams' | 'players';

/**
 * Search Screen
 * Enhanced search with filters and discovery
 */
export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { searchTournaments, searchTeams, searchPlayers, loading, error } = useDiscovery();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when query or filters change
  useEffect(() => {
    if (debouncedQuery.length >= 2 || selectedFormats.length > 0 || selectedStatuses.length > 0) {
      // Trigger search
      // Results will be handled by the hook
    }
  }, [debouncedQuery, selectedFormats, selectedStatuses]);

  const formatOptions = [
    { id: 't20', label: 'T20', value: 'T20' },
    { id: 'odi', label: 'ODI', value: 'ODI' },
    { id: 'test', label: 'Test', value: 'Test' },
    { id: 'custom', label: 'Custom', value: 'custom' },
  ];

  const statusOptions = [
    { id: 'draft', label: 'Draft', value: 'draft' },
    { id: 'pending', label: 'Pending', value: 'pending' },
    { id: 'official', label: 'Official', value: 'official' },
    { id: 'ongoing', label: 'Ongoing', value: 'ongoing' },
    { id: 'completed', label: 'Completed', value: 'completed' },
  ];

  const handleSearch = useCallback(async () => {
    if (searchType === 'tournaments' || searchType === 'all') {
      await searchTournaments({
        query: debouncedQuery,
        formats: selectedFormats,
        statuses: selectedStatuses,
      });
    }

    if (searchType === 'teams' || searchType === 'all') {
      await searchTeams({ query: debouncedQuery });
    }

    if (searchType === 'players' || searchType === 'all') {
      await searchPlayers({ query: debouncedQuery });
    }
  }, [searchType, debouncedQuery, selectedFormats, selectedStatuses, searchTournaments, searchTeams, searchPlayers]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      handleSearch();
    }
  }, [debouncedQuery, handleSearch]);

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
        </View>
      );
    }

    if (debouncedQuery.length < 2 && selectedFormats.length === 0 && selectedStatuses.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Start typing to search...
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Search for tournaments, teams, or players
          </Text>
        </View>
      );
    }

    // Results would be displayed here
    // For now, showing placeholder
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No results found
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tournaments, players, teams..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={handleSearch}
        />

        <SegmentedButtons
          value={searchType}
          onValueChange={(value) => setSearchType(value as SearchType)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'tournaments', label: 'Tournaments' },
            { value: 'teams', label: 'Teams' },
            { value: 'players', label: 'Players' },
          ]}
          style={styles.segmentedButtons}
        />

        {(searchType === 'tournaments' || searchType === 'all') && (
          <>
            <Text variant="titleSmall" style={styles.filterTitle}>
              Tournament Format
            </Text>
            <FilterChips
              options={formatOptions}
              selectedValues={selectedFormats}
              onSelectionChange={setSelectedFormats}
              multiSelect={true}
            />

            <Text variant="titleSmall" style={styles.filterTitle}>
              Status
            </Text>
            <FilterChips
              options={statusOptions}
              selectedValues={selectedStatuses}
              onSelectionChange={setSelectedStatuses}
              multiSelect={true}
            />
          </>
        )}
      </View>

      <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
        {renderResults()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    elevation: 2,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});

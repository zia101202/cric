import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Searchbar,
  SegmentedButtons,
  Chip,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { useDiscovery, DiscoveryItem, DiscoveryFilters } from '../../hooks/useDiscovery';
import { useNavigation } from '@react-navigation/native';

/**
 * DiscoveryScreen
 * Advanced search and discovery for tournaments, players, and teams
 */
export const DiscoveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { loading, error, discoverTournaments, discoverPlayers, discoverTeams } = useDiscovery();
  const [searchType, setSearchType] = useState<'tournaments' | 'players' | 'teams'>('tournaments');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    performSearch();
  }, [searchType, filters]);

  const performSearch = async () => {
    const searchFilters: DiscoveryFilters = {
      ...filters,
      query: searchQuery || undefined,
    };

    let result;
    switch (searchType) {
      case 'tournaments':
        result = await discoverTournaments(searchFilters, page, 20);
        break;
      case 'players':
        result = await discoverPlayers(searchFilters, page, 20);
        break;
      case 'teams':
        result = await discoverTeams(searchFilters, page, 20);
        break;
    }

    if (result.success && result.data) {
      setItems(result.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await performSearch();
    setRefreshing(false);
  };

  const handleItemPress = (item: DiscoveryItem) => {
    switch (item.type) {
      case 'tournament':
        // @ts-ignore
        navigation.navigate('TournamentDetail', { tournamentId: item.id });
        break;
      case 'player':
        // @ts-ignore
        navigation.navigate('PlayerDetail', { playerId: item.id });
        break;
      case 'team':
        // @ts-ignore
        navigation.navigate('TeamDetail', { teamId: item.id });
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Discover</Title>
        <Paragraph style={styles.headerSubtitle}>
          Find tournaments, players, and teams
        </Paragraph>
      </Surface>

      <Searchbar
        placeholder={`Search ${searchType}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={performSearch}
        style={styles.searchbar}
        accessibilityLabel={`Search ${searchType}`}
      />

      <SegmentedButtons
        value={searchType}
        onValueChange={(value) => setSearchType(value as 'tournaments' | 'players' | 'teams')}
        buttons={[
          { value: 'tournaments', label: 'Tournaments' },
          { value: 'players', label: 'Players' },
          { value: 'teams', label: 'Teams' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.filtersContainer}>
        <Paragraph style={styles.filtersLabel}>Filters:</Paragraph>
        <View style={styles.chipsContainer}>
          <Chip
            style={styles.filterChip}
            onPress={() => {
              // TODO: Open filter modal
            }}
            icon="filter"
          >
            Location
          </Chip>
          <Chip
            style={styles.filterChip}
            onPress={() => {
              // TODO: Open filter modal
            }}
            icon="calendar"
          >
            Date
          </Chip>
          <Chip
            style={styles.filterChip}
            onPress={() => {
              // TODO: Open filter modal
            }}
            icon="format-list-bulleted"
          >
            Format
          </Chip>
        </View>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Searching...</Paragraph>
        </View>
      ) : items.length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <Paragraph style={styles.emptyText}>
            {searchQuery
              ? `No ${searchType} found matching your search`
              : `No ${searchType} available`}
          </Paragraph>
        </Surface>
      ) : (
        items.map((item) => (
          <Card
            key={item.id}
            style={styles.itemCard}
            onPress={() => handleItemPress(item)}
            accessibilityLabel={`${item.type}: ${item.title}`}
          >
            <Card.Content>
              <View style={styles.itemHeader}>
                <Title style={styles.itemTitle}>{item.title}</Title>
                {item.rating && (
                  <Chip style={styles.ratingChip} textStyle={styles.ratingText}>
                    ⭐ {item.rating.toFixed(1)}
                  </Chip>
                )}
              </View>
              {item.description && (
                <Paragraph style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Paragraph>
              )}
              {item.location && (
                <View style={styles.itemMeta}>
                  <Paragraph style={styles.itemLocation}>📍 {item.location}</Paragraph>
                </View>
              )}
            </Card.Content>
          </Card>
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
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
  itemCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  ratingChip: {
    backgroundColor: '#FFD700',
    height: 28,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLocation: {
    fontSize: 13,
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


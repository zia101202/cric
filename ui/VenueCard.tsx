import React from 'react';
import { Card, CardContent, Title, Paragraph, Chip, IconButton, Button } from 'react-native-paper';
import { View, StyleSheet, Image } from 'react-native';
import { Venue } from '../hooks/useVenues';

interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
  onBook?: () => void;
  showBookButton?: boolean;
}

/**
 * VenueCard component
 * Displays venue information with images, amenities, and booking option
 */
export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onPress,
  onBook,
  showBookButton = true,
}) => {
  return (
    <Card style={styles.card} onPress={onPress} accessibilityLabel={`Venue: ${venue.name}`}>
      {venue.images && venue.images.length > 0 && (
        <Card.Cover source={{ uri: venue.images[0] }} style={styles.cover} />
      )}
      <CardContent>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Title style={styles.title}>{venue.name}</Title>
            <Paragraph style={styles.location}>{venue.location}</Paragraph>
          </View>
          {venue.latitude && venue.longitude && (
            <IconButton
              icon="map-marker"
              size={20}
              onPress={() => {
                // TODO: Open map
              }}
              accessibilityLabel="View on map"
            />
          )}
        </View>

        {venue.address && (
          <Paragraph style={styles.address} numberOfLines={2}>
            {venue.address}
          </Paragraph>
        )}

        <View style={styles.details}>
          {venue.capacity && (
            <View style={styles.detailItem}>
              <Paragraph style={styles.detailLabel}>Capacity:</Paragraph>
              <Paragraph style={styles.detailValue}>{venue.capacity}</Paragraph>
            </View>
          )}
        </View>

        {venue.amenities && venue.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <Chip key={index} style={styles.amenityChip} textStyle={styles.amenityText}>
                {amenity}
              </Chip>
            ))}
            {venue.amenities.length > 3 && (
              <Chip style={styles.amenityChip} textStyle={styles.amenityText}>
                +{venue.amenities.length - 3}
              </Chip>
            )}
          </View>
        )}

        {showBookButton && onBook && (
          <Button
            mode="contained"
            onPress={onBook}
            style={styles.bookButton}
            accessibilityLabel={`Book ${venue.name}`}
          >
            Book Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  cover: {
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 28,
    backgroundColor: '#E3F2FD',
  },
  amenityText: {
    fontSize: 12,
  },
  bookButton: {
    marginTop: 8,
  },
});


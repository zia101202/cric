import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar, Text, Chip, IconButton } from 'react-native-paper';
import { Tournament, TournamentStatus } from '../store/tournamentStore';

/**
 * Props for TournamentCard component
 */
interface TournamentCardProps {
  tournament: Tournament;
  onPress?: (tournament: Tournament) => void;
  showActions?: boolean;
}

/**
 * TournamentCard component
 * Displays tournament summary with key information
 * Used in tournament lists and discovery screens
 */
export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onPress,
  showActions = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(tournament);
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case 'official':
        return '#4caf50';
      case 'ongoing':
        return '#2196f3';
      case 'completed':
        return '#757575';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: TournamentStatus) => {
    switch (status) {
      case 'official':
        return 'Official';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.tournamentInfo}>
              {tournament.venue?.imageUrl ? (
                <Avatar.Image size={56} source={{ uri: tournament.venue.imageUrl }} />
              ) : (
                <Avatar.Text size={56} label={tournament.name.charAt(0).toUpperCase()} />
              )}
              <View style={styles.tournamentDetails}>
                <Text variant="titleMedium" style={styles.tournamentName}>
                  {tournament.name}
                </Text>
                <Text variant="bodySmall" style={styles.organizerName}>
                  {tournament.organizerName}
                </Text>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(tournament.status) + '20' },
                  ]}
                  textStyle={[
                    styles.statusChipText,
                    { color: getStatusColor(tournament.status) },
                  ]}
                >
                  {getStatusLabel(tournament.status)}
                </Chip>
              </View>
            </View>
            {showActions && (
              <IconButton icon="chevron-right" size={20} onPress={handlePress} />
            )}
          </View>

          {tournament.description && (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {tournament.description}
            </Text>
          )}

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Format:
              </Text>
              <Chip mode="flat" compact style={styles.formatChip}>
                {tournament.format}
                {tournament.customOvers && ` (${tournament.customOvers} overs)`}
              </Chip>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Type:
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {tournament.type.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Dates:
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Teams
              </Text>
              <Text variant="bodyMedium" style={styles.statValue}>
                {tournament.currentTeams}/{tournament.maxTeams}
              </Text>
            </View>
            {tournament.entryFee > 0 && (
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Entry Fee
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  ${tournament.entryFee}
                </Text>
              </View>
            )}
            {tournament.prizeAmount > 0 && (
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Prize
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  ${tournament.prizeAmount}
                </Text>
              </View>
            )}
            {tournament.venue && (
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Venue
                </Text>
                <Text variant="bodySmall" style={styles.statValue} numberOfLines={1}>
                  {tournament.venue.name}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  tournamentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  tournamentName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  organizerName: {
    color: '#666',
    marginBottom: 4,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  infoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
  },
  formatChip: {
    alignSelf: 'flex-start',
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
});


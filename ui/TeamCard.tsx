import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar, Text, Chip, IconButton } from 'react-native-paper';
import { Team } from '../store/teamStore';
import { useTeamManagement } from '../hooks/useTeamManagement';

/**
 * Props for TeamCard component
 */
interface TeamCardProps {
  team: Team;
  onPress?: (team: Team) => void;
  showActions?: boolean;
}

/**
 * TeamCard component
 * Displays team information, members, rating, and badges
 * Used in team lists and team management screens
 */
export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onPress,
  showActions = false,
}) => {
  const { getTeamBadges, isStrongTeam } = useTeamManagement();
  const badges = getTeamBadges(team.id);
  const isStrong = isStrongTeam(team);

  const handlePress = () => {
    if (onPress) {
      onPress(team);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.teamInfo}>
              {team.logoUrl ? (
                <Avatar.Image size={56} source={{ uri: team.logoUrl }} />
              ) : (
                <Avatar.Text size={56} label={team.name.charAt(0).toUpperCase()} />
              )}
              <View style={styles.teamDetails}>
                <Text variant="titleMedium" style={styles.teamName}>
                  {team.name}
                </Text>
                <Text variant="bodySmall" style={styles.ownerName}>
                  Owner: {team.ownerName}
                </Text>
                {isStrong && (
                  <Chip icon="trophy" style={styles.badgeChip} textStyle={styles.badgeText}>
                    Strong Team
                  </Chip>
                )}
              </View>
            </View>
            {showActions && (
              <IconButton icon="chevron-right" size={20} onPress={handlePress} />
            )}
          </View>

          {team.description && (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {team.description}
            </Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Players
              </Text>
              <Text variant="bodyMedium" style={styles.statValue}>
                {team.acceptedPlayers}/{team.totalPlayers}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Matches
              </Text>
              <Text variant="bodyMedium" style={styles.statValue}>
                {team.matchesPlayed}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Win Rate
              </Text>
              <Text variant="bodyMedium" style={styles.statValue}>
                {(team.winRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={styles.statLabel}>
                Rating
              </Text>
              <Text variant="bodyMedium" style={styles.statValue}>
                {team.strengthScore.toFixed(1)}
              </Text>
            </View>
          </View>

          {badges.length > 0 && badges[0].type !== 'none' && (
            <View style={styles.badgesContainer}>
              {badges.map((badge, index) => (
                <Chip
                  key={index}
                  icon={badge.icon}
                  style={styles.badge}
                  textStyle={styles.badgeText}
                >
                  {badge.label}
                </Chip>
              ))}
            </View>
          )}

          {team.captainName && (
            <View style={styles.captainInfo}>
              <Text variant="bodySmall" style={styles.captainText}>
                Captain: {team.captainName}
                {team.viceCaptainName && ` | VC: ${team.viceCaptainName}`}
              </Text>
            </View>
          )}
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
  teamInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  teamDetails: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ownerName: {
    color: '#666',
    marginBottom: 4,
  },
  description: {
    color: '#666',
    marginBottom: 12,
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
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  badge: {
    marginRight: 8,
    marginBottom: 4,
  },
  badgeChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
  },
  captainInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  captainText: {
    color: '#666',
    fontStyle: 'italic',
  },
});


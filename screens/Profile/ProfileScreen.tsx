import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Avatar, Divider } from 'react-native-paper';
import { useUserProfileStore } from '../../store/userProfileStore';
import { useUserProfile } from '../../hooks/useUserProfile';
import { StatCard } from '../../ui/StatCard';
import { PlayerRoleSelector } from '../../ui/PlayerRoleSelector';
import { ProfilePictureUploader } from '../../ui/ProfilePictureUploader';

/**
 * Profile Screen
 * Displays and allows editing of user profile
 */
export function ProfileScreen() {
  const { profile, isLoading } = useUserProfileStore();
  const { fetchProfile, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No profile found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <ProfilePictureUploader
            currentImageUrl={profile.profilePictureUrl}
            onImageSelected={async (uri) => {
              // Handle image upload
              return { success: true };
            }}
          />
          <Text variant="headlineMedium" style={styles.name}>
            {profile.displayName}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {profile.email}
          </Text>
          {profile.playerRole && (
            <Text variant="bodySmall" style={styles.role}>
              {profile.playerRole}
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <StatCard
          title="Batting Average"
          value={profile.battingAverage?.toFixed(2) || '0.00'}
          icon="chart-line"
          highlight={profile.battingAverage && profile.battingAverage > 30}
        />
        <StatCard
          title="Strike Rate"
          value={profile.strikeRate?.toFixed(2) || '0.00'}
          icon="speedometer"
        />
        <StatCard
          title="Economy Rate"
          value={profile.economyRate?.toFixed(2) || '0.00'}
          icon="chart-bar"
        />
        <StatCard
          title="Matches Played"
          value={profile.matchesPlayed.toString()}
          icon="calendar"
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Player Role</Text>
          <Divider style={styles.divider} />
          <PlayerRoleSelector
            selectedRole={profile.playerRole}
            onRoleSelect={(role) => {
              if (isEditing) {
                updateProfile({ playerRole: role });
              }
            }}
            disabled={!isEditing}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => {
          if (isEditing) {
            fetchProfile(); // refresh after potential edits
          }
          setIsEditing(!isEditing);
        }}
        style={styles.editButton}
      >
        {isEditing ? 'Save Changes' : 'Edit Profile'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  role: {
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  divider: {
    marginVertical: 12,
  },
  editButton: {
    margin: 16,
    marginTop: 8,
  },
});


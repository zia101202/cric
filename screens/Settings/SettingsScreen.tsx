import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, List, Divider, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

/**
 * Settings Screen
 * Central hub for accessing all app features and options
 */
export function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const handleNavigate = (screen: string, params?: any) => {
    // @ts-ignore
    navigation.navigate(screen, params);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Features Section */}
      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Main Features</List.Subheader>
            <List.Item
              title="Home"
              description="Dashboard and overview"
              left={(props) => <List.Icon {...props} icon="home" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Home')}
            />
            <Divider />
            <List.Item
              title="Analytics"
              description="Player and team statistics"
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Analytics')}
            />
            <Divider />
            <List.Item
              title="Wallet"
              description="Balance and transactions"
              left={(props) => <List.Icon {...props} icon="wallet" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Wallet')}
            />
            <Divider />
            <List.Item
              title="Messages"
              description="Chat with other users"
              left={(props) => <List.Icon {...props} icon="message" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Chat')}
            />
            <Divider />
            <List.Item
              title="Search"
              description="Find tournaments, players, and teams"
              left={(props) => <List.Icon {...props} icon="magnify" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Search')}
            />
            <Divider />
            <List.Item
              title="Profile"
              description="View and edit your profile"
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Profile')}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Additional Features Section */}
      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Additional Features</List.Subheader>
            <List.Item
              title="Notifications"
              description="View your notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Notifications')}
            />
            <Divider />
            <List.Item
              title="Coaching & Tips"
              description="Get personalized coaching tips"
              left={(props) => <List.Icon {...props} icon="school" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Coaching')}
            />
            <Divider />
            <List.Item
              title="Discover"
              description="Explore tournaments and players"
              left={(props) => <List.Icon {...props} icon="compass" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Discovery')}
            />
            <Divider />
            <List.Item
              title="Venues"
              description="Find and book venues"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('VenueSearch')}
            />
            <Divider />
            <List.Item
              title="Subscriptions"
              description="Manage your subscriptions"
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Subscriptions')}
            />
            <Divider />
            <List.Item
              title="Reputation"
              description="View achievements and reputation"
              left={(props) => <List.Icon {...props} icon="trophy" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Reputation')}
            />
            <Divider />
            <List.Item
              title="Export & Share"
              description="Export data and share content"
              left={(props) => <List.Icon {...props} icon="export" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleNavigate('Export')}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Admin Section (if user is admin) */}
      {user?.role === 'admin' && (
        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>Admin</List.Subheader>
              <List.Item
                title="Admin Panel"
                description="Manage users and tournaments"
                left={(props) => <List.Icon {...props} icon="shield-account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => handleNavigate('Admin')}
              />
            </List.Section>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
});


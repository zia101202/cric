import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

// Onboarding Screens
import { LoginScreen } from '../screens/Onboarding/LoginScreen';
import { RegisterScreen } from '../screens/Onboarding/RegisterScreen';
import { OtpVerificationScreen } from '../screens/Onboarding/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/Onboarding/ForgotPasswordScreen';

// Main Feature Screens (Placeholders - to be implemented)
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { TeamsScreen } from '../screens/Teams/TeamsScreen';
import { TournamentsScreen } from '../screens/Tournaments/TournamentsScreen';
import { MatchesScreen } from '../screens/Matches/MatchesScreen';
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen';
import { WalletScreen } from '../screens/Wallet/WalletScreen';
import { ChatScreen } from '../screens/Social/ChatScreen';
import { NotificationsScreen } from '../screens/Social/NotificationsScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { AdminScreen } from '../screens/Admin/AdminScreen';

// Detail Screens
import { TeamDetailScreen } from '../screens/Teams/TeamDetailScreen';
import { TournamentDetailScreen } from '../screens/Tournaments/TournamentDetailScreen';
import { MatchDetailScreen } from '../screens/Matches/MatchDetailScreen';
import { PlayerDetailScreen } from '../screens/Players/PlayerDetailScreen';
import { PlayerAnalyticsScreen } from '../screens/Analytics/PlayerAnalyticsScreen';
import { TeamAnalyticsScreen } from '../screens/Analytics/TeamAnalyticsScreen';

// Create Screens
import { CreateTournamentScreen } from '../screens/Tournaments/CreateTournamentScreen';
import { CreateTeamScreen } from '../screens/Teams/CreateTeamScreen';

// Settings Screen
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

// Advanced Feature Screens
import { CoachingScreen } from '../screens/Coaching/CoachingScreen';
import { ExportScreen } from '../screens/Export/ExportScreen';
import { ReputationScreen } from '../screens/Reputation/ReputationScreen';
import { VenueSearchScreen } from '../screens/Venues/VenueSearchScreen';
import { VenueBookingScreen } from '../screens/Venues/VenueBookingScreen';
import { MyBookingsScreen } from '../screens/Venues/MyBookingsScreen';
import { SubscriptionsScreen } from '../screens/Subscriptions/SubscriptionsScreen';
import { DiscoveryScreen } from '../screens/Discovery/DiscoveryScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
  ForgotPassword: undefined;
  // Bottom Tab Screens
  Tournaments: undefined;
  Teams: undefined;
  Matches: undefined;
  Settings: undefined;
  // Stack Screens (accessible from Settings)
  Home: undefined;
  Analytics: undefined;
  Wallet: undefined;
  Chat: { recipientId?: string; recipientName?: string } | undefined;
  Search: undefined;
  Profile: undefined;
  Notifications: undefined;
  Admin: undefined;
  // Detail Screens
  TeamDetail: { teamId: string };
  PlayerDetail: { playerId: string };
  TournamentDetail: { tournamentId: string };
  MatchDetail: { matchId: string };
  PlayerAnalytics: { playerId: string };
  TeamAnalytics: { teamId: string };
  Coaching: undefined;
  Export: undefined;
  Reputation: undefined;
  VenueSearch: undefined;
  VenueBooking: { venueId: string };
  VenueDetail: { venueId: string };
  MyBookings: undefined;
  Subscriptions: undefined;
  Discovery: undefined;
  CreateTournament: undefined;
  CreateTeam: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator
 * Contains all main feature tabs
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Tournaments':
              iconName = 'trophy';
              break;
            case 'Teams':
              iconName = 'account-group';
              break;
            case 'Matches':
              iconName = 'cricket';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'help';
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Tournaments" component={TournamentsScreen} options={{ title: 'Tournaments' }} />
      <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: 'Teams' }} />
      <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: 'Matches' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * Handles authentication flow and main app navigation
 */
export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Loading handled in App.tsx
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Onboarding Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // Authenticated Stack
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          {/* Stack Screens accessible from Settings */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: true, title: 'Home' }}
          />
          <Stack.Screen 
            name="Analytics" 
            component={AnalyticsScreen} 
            options={{ headerShown: true, title: 'Analytics' }}
          />
          <Stack.Screen 
            name="Wallet" 
            component={WalletScreen} 
            options={{ headerShown: true, title: 'Wallet' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ headerShown: true, title: 'Messages' }}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen} 
            options={{ headerShown: true, title: 'Search' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: true, title: 'Profile' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen} 
            options={{ headerShown: true, title: 'Notifications' }}
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ headerShown: true, title: 'Admin Panel' }}
          />
          {/* Detail Screens */}
          <Stack.Screen 
            name="TeamDetail" 
            component={TeamDetailScreen} 
            options={{ headerShown: true, title: 'Team Details' }}
          />
          <Stack.Screen 
            name="TournamentDetail" 
            component={TournamentDetailScreen} 
            options={{ headerShown: true, title: 'Tournament Details' }}
          />
          <Stack.Screen 
            name="MatchDetail" 
            component={MatchDetailScreen} 
            options={{ headerShown: true, title: 'Match Details' }}
          />
          <Stack.Screen 
            name="PlayerDetail" 
            component={PlayerDetailScreen} 
            options={{ headerShown: true, title: 'Player Detail' }}
          />
          <Stack.Screen 
            name="PlayerAnalytics" 
            component={PlayerAnalyticsScreen} 
            options={{ headerShown: true, title: 'Player Analytics' }}
          />
          <Stack.Screen 
            name="TeamAnalytics" 
            component={TeamAnalyticsScreen} 
            options={{ headerShown: true, title: 'Team Analytics' }}
          />
          <Stack.Screen 
            name="Coaching" 
            component={CoachingScreen} 
            options={{ headerShown: true, title: 'Coaching & Tips' }}
          />
          <Stack.Screen 
            name="Export" 
            component={ExportScreen} 
            options={{ headerShown: true, title: 'Export & Share' }}
          />
          <Stack.Screen 
            name="Reputation" 
            component={ReputationScreen} 
            options={{ headerShown: true, title: 'Reputation & Achievements' }}
          />
          <Stack.Screen 
            name="VenueSearch" 
            component={VenueSearchScreen} 
            options={{ headerShown: true, title: 'Find Venues' }}
          />
          <Stack.Screen 
            name="VenueBooking" 
            component={VenueBookingScreen} 
            options={{ headerShown: true, title: 'Book Venue' }}
          />
          <Stack.Screen 
            name="VenueDetail" 
            component={VenueSearchScreen} 
            options={{ headerShown: true, title: 'Venue Details' }}
          />
          <Stack.Screen 
            name="MyBookings" 
            component={MyBookingsScreen} 
            options={{ headerShown: true, title: 'My Bookings' }}
          />
          <Stack.Screen 
            name="Subscriptions" 
            component={SubscriptionsScreen} 
            options={{ headerShown: true, title: 'Subscriptions' }}
          />
          <Stack.Screen 
            name="Discovery" 
            component={DiscoveryScreen} 
            options={{ headerShown: true, title: 'Discover' }}
          />
          <Stack.Screen 
            name="CreateTournament" 
            component={CreateTournamentScreen} 
            options={{ headerShown: true, title: 'Create Tournament' }}
          />
          <Stack.Screen 
            name="CreateTeam" 
            component={CreateTeamScreen} 
            options={{ headerShown: true, title: 'Create Team' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}


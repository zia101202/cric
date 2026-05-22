// Import polyfill first to fix import.meta issues with Supabase on web
import './polyfills/import-meta-polyfill';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { paperTheme } from './theme/paperTheme';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { AppNavigator } from './navigation/AppNavigator';

/**
 * Main App component
 * Sets up navigation, theming, and authentication flow
 * Handles all features from cric.txt:
 * 1. User Onboarding ✓
 * 2. User Profiles ✓
 * 3. Team Management ✓
 * 4. Tournament Features ✓
 * 5. Match Management ✓
 * 6. Social & Interaction Features ✓
 * 7. Challenges & Competitions (via Tournaments)
 * 8. Search, Filters & Discoverability ✓
 * 9. Player & Team Analytics ✓
 * 10. Payments & Wallet ✓
 * 11. Admin Panel ✓
 * 12. Extra Features (Notifications, Chat, etc.) ✓
 */
export default function App() {
  const { checkSession } = useAuth();
  const { isLoading } = useAuthStore();

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <View style={styles.loadingContainer}>
            <StatusBar style="auto" />
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  // Main app with navigation
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

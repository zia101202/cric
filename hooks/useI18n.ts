import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';
// Note: Requires expo-localization package
// import * as Localization from 'expo-localization';

/**
 * Supported locales
 */
export type Locale = 'en' | 'hi' | 'es' | 'fr' | 'ar';

/**
 * Translation strings interface
 */
export interface Translations {
  [key: string]: string | Translations;
}

/**
 * Default English translations
 */
const defaultTranslations: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    share: 'Share',
    export: 'Export',
    refresh: 'Refresh',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
  },
  matches: {
    title: 'Matches',
    create: 'Create Match',
    scorecard: 'Scorecard',
    upcoming: 'Upcoming Matches',
    past: 'Past Matches',
    live: 'Live Matches',
  },
  teams: {
    title: 'Teams',
    create: 'Create Team',
    members: 'Members',
    join: 'Join Team',
    leave: 'Leave Team',
  },
  tournaments: {
    title: 'Tournaments',
    create: 'Create Tournament',
    join: 'Join Tournament',
    standings: 'Standings',
    brackets: 'Brackets',
  },
  coaching: {
    title: 'Coaching & Tips',
    tips: 'Tips',
    analysis: 'Analysis',
    plan: 'Training Plan',
    performance: 'Performance',
    strengths: 'Strengths',
    weaknesses: 'Areas to Improve',
    recommendations: 'Recommendations',
  },
  export: {
    title: 'Export & Share',
    scorecard: 'Scorecard',
    tournament: 'Tournament',
    poster: 'Poster',
    generate: 'Generate',
    download: 'Download',
  },
  reputation: {
    title: 'Reputation & Achievements',
    points: 'Points',
    level: 'Level',
    badges: 'Badges',
    timeline: 'Timeline',
    overview: 'Overview',
    progress: 'Progress to Next Level',
  },
  venues: {
    title: 'Venues',
    search: 'Search Venues',
    book: 'Book Venue',
    myBookings: 'My Bookings',
    availability: 'Availability',
    selectSlot: 'Select Time Slot',
    bookingSummary: 'Booking Summary',
  },
  subscriptions: {
    title: 'Subscriptions',
    plans: 'Plans',
    current: 'Current Plan',
    upgrade: 'Upgrade',
    cancel: 'Cancel Subscription',
    features: 'Features',
    monthly: 'Monthly',
    annual: 'Annual',
  },
  discovery: {
    title: 'Discover',
    tournaments: 'Tournaments',
    players: 'Players',
    teams: 'Teams',
    filters: 'Filters',
    location: 'Location',
    date: 'Date',
    format: 'Format',
  },
};

/**
 * Custom hook for internationalization (i18n)
 * Provides translated strings and locale switching
 */
export const useI18n = () => {
  const { user } = useAuthStore();
  const [locale, setLocale] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);
  const [loading, setLoading] = useState(false);

  // Initialize locale from device or user preference
  useEffect(() => {
    initializeLocale();
  }, [user]);

  const initializeLocale = async () => {
    try {
      // Try to get user's preferred locale
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single();

        if (data?.preferred_language) {
          setLocale(data.preferred_language as Locale);
          await loadTranslations(data.preferred_language as Locale);
          return;
        }
      }

      // Fallback to device locale
      // TODO: Implement device locale detection
      // Requires expo-localization package
      // const deviceLocale = Localization.locale.split('-')[0] as Locale;
      const supportedLocales: Locale[] = ['en', 'hi', 'es', 'fr', 'ar'];
      const detectedLocale = 'en'; // Placeholder - default to English
      setLocale(detectedLocale);
      await loadTranslations(detectedLocale);
    } catch (error) {
      console.error('Failed to initialize locale:', error);
      setLocale('en');
      setTranslations(defaultTranslations);
    }
  };

  const loadTranslations = async (targetLocale: Locale) => {
    setLoading(true);
    try {
      // In production, load from JSON files or API
      // For now, use default translations
      // TODO: Implement actual translation loading
      setTranslations(defaultTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations(defaultTranslations);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change locale
   */
  const changeLocale = useCallback(
    async (newLocale: Locale) => {
      setLocale(newLocale);
      await loadTranslations(newLocale);

      // Save preference to user profile
      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({ preferred_language: newLocale })
          .eq('id', user.id);
      }
    },
    [user]
  );

  /**
   * Get translated string
   */
  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Replace parameters
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }

      return value;
    },
    [translations]
  );

  /**
   * Check if RTL (Right-to-Left) layout is needed
   */
  const isRTL = useCallback(() => {
    return locale === 'ar';
  }, [locale]);

  return {
    locale,
    loading,
    t,
    changeLocale,
    isRTL,
  };
};


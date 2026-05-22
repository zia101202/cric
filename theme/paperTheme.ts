import { MD3LightTheme } from 'react-native-paper';

/**
 * React Native Paper theme configuration
 * Customizes colors, fonts, and other UI elements for consistent styling
 */
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    secondary: '#5856D6',
    error: '#d32f2f',
    surface: '#ffffff',
    background: '#f5f5f5',
  },
};


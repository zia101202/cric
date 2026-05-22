import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

/**
 * Props for AddMoneyButton component
 */
interface AddMoneyButtonProps {
  onPress: () => void;
  variant?: 'button' | 'icon';
  label?: string;
}

/**
 * AddMoneyButton component
 * Opens add money screen
 * Paper Button + IconButton variant
 */
export const AddMoneyButton: React.FC<AddMoneyButtonProps> = ({
  onPress,
  variant = 'button',
  label = 'Add Money',
}) => {
  if (variant === 'icon') {
    return (
      <IconButton
        icon="plus-circle"
        size={32}
        iconColor="#4caf50"
        onPress={onPress}
        style={styles.iconButton}
      />
    );
  }

  return (
    <Button
      mode="contained"
      icon="plus-circle"
      onPress={onPress}
      style={styles.button}
      contentStyle={styles.buttonContent}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  iconButton: {
    margin: 0,
  },
});


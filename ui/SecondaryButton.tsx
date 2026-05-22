import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Secondary action button component
 * Used for alternative actions like cancel, back, skip
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  testID,
  accessibilityLabel,
}) => {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      disabled={disabled}
      style={styles.button}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});


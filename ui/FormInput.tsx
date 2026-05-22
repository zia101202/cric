import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  disabled?: boolean;
  maxLength?: number;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Reusable form input component with error handling
 * Uses React Native Paper TextInput for consistent styling
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoFocus = false,
  disabled = false,
  maxLength,
  testID,
  accessibilityLabel,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        disabled={disabled}
        error={!!error}
        maxLength={maxLength}
        testID={testID}
        accessibilityLabel={accessibilityLabel || label}
        style={styles.input}
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.helperText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  helperText: {
    marginTop: -8,
  },
});


import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FormInput, PrimaryButton, SecondaryButton } from '../../ui';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, validatePassword } from '../../utils/validation';

/**
 * Registration screen component
 * Handles new user registration with email and password validation
 * Navigates to OTP verification after successful registration
 */
export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, error, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Clear errors when inputs change
  useEffect(() => {
    if (email && emailError) setEmailError('');
    if (password && passwordError) setPasswordError('');
    if (confirmPassword && confirmPasswordError) setConfirmPasswordError('');
    if (error) clearError();
  }, [email, password, confirmPassword, emailError, passwordError, confirmPasswordError, error, clearError]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || 'Invalid password');
        isValid = false;
      }
    }

    // Validate password confirmation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle registration submission
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    const result = await register(email.trim(), password);
    if (result.success) {
      // Navigate to OTP verification screen
      navigation.navigate('OtpVerification' as never, { email: email.trim() } as never);
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid =
    email.trim() &&
    password &&
    confirmPassword &&
    isValidEmail(email) &&
    validatePassword(password).isValid &&
    password === confirmPassword;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Join us to get started with cricket
          </Text>

          <View style={styles.form}>
            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus={true}
              testID="register-email-input"
              accessibilityLabel="Email input field"
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              autoCapitalize="none"
              testID="register-password-input"
              accessibilityLabel="Password input field"
            />

            <FormInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmPasswordError}
              secureTextEntry
              autoCapitalize="none"
              testID="register-confirm-password-input"
              accessibilityLabel="Confirm password input field"
            />

            {error && (
              <Text variant="bodySmall" style={styles.errorText} testID="register-error">
                {error}
              </Text>
            )}

            <PrimaryButton
              label="Sign Up"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid}
              testID="register-submit-button"
              accessibilityLabel="Sign up button"
            />
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.linkText}
              onPress={() => navigation.navigate('Login' as never)}
              testID="login-link"
              accessibilityLabel="Navigate to login screen"
            >
              Sign In
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});


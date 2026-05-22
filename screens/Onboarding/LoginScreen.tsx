import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FormInput, PrimaryButton, SecondaryButton } from '../../ui';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validation';
import { useAuthStore } from '../../store/authStore';

/**
 * Login screen component
 * Handles user authentication with email and password
 * Navigates to register or forgot password screens
 */
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, error, isLoading, clearError } = useAuth();
  const { isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Navigation handled by AppNavigator based on auth state

  // Clear errors when inputs change
  useEffect(() => {
    if (email && emailError) setEmailError('');
    if (password && passwordError) setPasswordError('');
    if (error) clearError();
  }, [email, password, emailError, passwordError, error, clearError]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle login submission
   */
  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await login(email.trim(), password);
    if (result.success) {
      // Navigation handled by useEffect watching isAuthenticated
    }
  };

  const isFormValid = email.trim() && password && isValidEmail(email);

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
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to continue to your cricket app
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
              testID="login-email-input"
              accessibilityLabel="Email input field"
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              autoCapitalize="none"
              testID="login-password-input"
              accessibilityLabel="Password input field"
            />

            {error && (
              <Text variant="bodySmall" style={styles.errorText} testID="login-error">
                {error}
              </Text>
            )}

            <PrimaryButton
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!isFormValid}
              testID="login-submit-button"
              accessibilityLabel="Sign in button"
            />

            <SecondaryButton
              label="Forgot Password?"
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              testID="forgot-password-button"
              accessibilityLabel="Navigate to forgot password screen"
            />
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Don't have an account?{' '}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.linkText}
              onPress={() => navigation.navigate('Register' as never)}
              testID="register-link"
              accessibilityLabel="Navigate to register screen"
            >
              Sign Up
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


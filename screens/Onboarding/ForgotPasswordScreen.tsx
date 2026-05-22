import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FormInput, PrimaryButton, SecondaryButton } from '../../ui';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validation';

/**
 * Forgot password screen component
 * Handles password reset by sending reset link to user's email
 * Shows success message after email is sent
 */
export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { resetPassword, error, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear errors when input changes
  useEffect(() => {
    if (email && emailError) setEmailError('');
    if (error) clearError();
  }, [email, emailError, error, clearError]);

  /**
   * Validate email input
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  /**
   * Handle password reset submission
   */
  const handleResetPassword = async () => {
    if (!validateForm()) return;

    const result = await resetPassword(email.trim());
    if (result.success) {
      setIsSuccess(true);
      // Navigate back to login after a delay to show success message
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 2000);
    }
  };

  const isFormValid = email.trim() && isValidEmail(email);

  if (isSuccess) {
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
              Check Your Email
            </Text>
            <Text variant="bodyMedium" style={styles.successText}>
              We've sent a password reset link to
            </Text>
            <Text variant="bodyMedium" style={styles.emailText}>
              {email}
            </Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              Please check your inbox and follow the instructions to reset your password.
            </Text>
            <SecondaryButton
              label="Back to Login"
              onPress={() => navigation.navigate('Login' as never)}
              testID="back-to-login-button"
              accessibilityLabel="Navigate back to login screen"
            />
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
            Forgot Password
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
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
              testID="forgot-password-email-input"
              accessibilityLabel="Email input field"
            />

            {error && (
              <Text variant="bodySmall" style={styles.errorText} testID="forgot-password-error">
                {error}
              </Text>
            )}

            <PrimaryButton
              label="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={!isFormValid}
              testID="reset-password-button"
              accessibilityLabel="Send password reset link button"
            />

            <SecondaryButton
              label="Back to Login"
              onPress={onNavigateToLogin}
              testID="back-to-login-button"
              accessibilityLabel="Navigate back to login screen"
            />
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
  successText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emailText: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    paddingHorizontal: 16,
  },
});


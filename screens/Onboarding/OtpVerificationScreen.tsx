import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FormInput, PrimaryButton, SecondaryButton } from '../../ui';
import { useAuth } from '../../hooks/useAuth';
import { isValidOtp } from '../../utils/validation';
import { useAuthStore } from '../../store/authStore';

/**
 * OTP verification screen component
 * Handles email verification using OTP code sent to user's email
 * Navigates to login or success screen after verification
 */
export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = (route.params as { email: string })?.email || '';
  const { verifyOtp, error, isLoading, clearError } = useAuth();
  const { isAuthenticated } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Navigation handled by AppNavigator based on auth state

  // Clear errors when input changes
  useEffect(() => {
    if (otp && otpError) setOtpError('');
    if (error) clearError();
  }, [otp, otpError, error, clearError]);

  /**
   * Validate OTP input
   */
  const validateForm = (): boolean => {
    if (!otp.trim()) {
      setOtpError('OTP code is required');
      return false;
    }

    if (!isValidOtp(otp)) {
      setOtpError('Please enter a valid 6-digit OTP code');
      return false;
    }

    return true;
  };

  /**
   * Handle OTP verification submission
   */
  const handleVerifyOtp = async () => {
    if (!validateForm()) return;

    const result = await verifyOtp(email, otp.trim());
    if (result.success) {
      // Navigation handled by useEffect watching isAuthenticated
    }
  };

  const isFormValid = otp.trim() && isValidOtp(otp);

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
            Verify Email
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text variant="bodyMedium" style={styles.emailText}>
            {email}
          </Text>

          <View style={styles.form}>
            <FormInput
              label="Enter OTP Code"
              value={otp}
              onChangeText={setOtp}
              error={otpError}
              keyboardType="numeric"
              autoCapitalize="none"
              autoFocus={true}
              maxLength={6}
              testID="otp-input"
              accessibilityLabel="OTP code input field"
            />

            {error && (
              <Text variant="bodySmall" style={styles.errorText} testID="otp-error">
                {error}
              </Text>
            )}

            <PrimaryButton
              label="Verify"
              onPress={handleVerifyOtp}
              loading={isLoading}
              disabled={!isFormValid}
              testID="verify-otp-button"
              accessibilityLabel="Verify OTP button"
            />

            <SecondaryButton
              label="Back to Login"
              onPress={() => navigation.navigate('Login' as never)}
              testID="back-to-login-button"
              accessibilityLabel="Navigate back to login screen"
            />
          </View>

          <View style={styles.resendContainer}>
            <Text variant="bodySmall" style={styles.resendText}>
              Didn't receive the code?{' '}
            </Text>
            <Text
              variant="bodySmall"
              style={styles.resendLink}
              onPress={() => {
                // TODO: Implement resend OTP functionality
                console.log('Resend OTP');
              }}
              testID="resend-otp-link"
              accessibilityLabel="Resend OTP code"
            >
              Resend
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
    marginBottom: 8,
    color: '#666',
  },
  emailText: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#666',
  },
  resendLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});


/**
 * Validation utilities for form inputs
 * Provides email and password validation functions
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * Requirements: at least 8 characters, contains uppercase, lowercase, and number
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    };
  }

  return { isValid: true };
};

/**
 * Validates OTP token format (6 digits)
 * @param token - OTP token to validate
 * @returns true if token is valid, false otherwise
 */
export const isValidOtp = (token: string): boolean => {
  return /^\d{6}$/.test(token.trim());
};


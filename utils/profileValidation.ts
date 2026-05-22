/**
 * Validation utilities for user profile forms
 */

/**
 * Validates full name
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Full name must be less than 50 characters' };
  }
  return { isValid: true };
};

/**
 * Validates display name
 */
export const validateDisplayName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Display name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }
  if (name.trim().length > 30) {
    return { isValid: false, error: 'Display name must be less than 30 characters' };
  }
  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
    return {
      isValid: false,
      error: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores',
    };
  }
  return { isValid: true };
};

/**
 * Validates phone number
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  // Basic phone validation (10-15 digits, may include +, -, spaces, parentheses)
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true };
};

/**
 * Validates date of birth
 */
export const validateDateOfBirth = (date: string): { isValid: boolean; error?: string } => {
  if (!date.trim()) {
    return { isValid: true }; // Date of birth is optional
  }

  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  if (age < 5) {
    return { isValid: false, error: 'Age must be at least 5 years' };
  }

  if (age > 100) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }

  return { isValid: true };
};

/**
 * Validates bio
 */
export const validateBio = (bio: string): { isValid: boolean; error?: string } => {
  if (!bio.trim()) {
    return { isValid: true }; // Bio is optional
  }
  if (bio.trim().length > 500) {
    return { isValid: false, error: 'Bio must be less than 500 characters' };
  }
  return { isValid: true };
};

/**
 * Validates location
 */
export const validateLocation = (location: string): { isValid: boolean; error?: string } => {
  if (!location.trim()) {
    return { isValid: true }; // Location is optional
  }
  if (location.trim().length > 100) {
    return { isValid: false, error: 'Location must be less than 100 characters' };
  }
  return { isValid: true };
};


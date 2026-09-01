// ============================================
// Shared Validation Functions
// Used by both controllers and routes
// ============================================

/**
 * Validate user name (20-60 characters)
 */
function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20) return 'Name must be at least 20 characters.';
  if (trimmed.length > 60) return 'Name must be at most 60 characters.';
  return null;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validate password (8-16 chars, 1 uppercase, 1 special character)
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 16) return 'Password must be at most 16 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

/**
 * Validate address (max 400 characters)
 */
function validateAddress(address) {
  if (address && typeof address === 'string' && address.trim().length > 400) {
    return 'Address must be at most 400 characters.';
  }
  return null;
}

/**
 * Validate rating (integer 1-5)
 */
function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

/**
 * Validate role value
 */
function validateRole(role) {
  const validRoles = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) {
    return 'Role must be one of: ADMIN, NORMAL_USER, STORE_OWNER.';
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
  validateRole,
};

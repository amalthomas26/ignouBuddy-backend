// Enrollment number: 9 digits (pre-2020) or 10 digits (2020 onwards)
export const ENROLLMENT_NUMBER_REGEX = /^\d{9,10}$/;
export const ENROLLMENT_NUMBER_MIN_LENGTH = 9;
export const ENROLLMENT_NUMBER_MAX_LENGTH = 10;

// IGNOU exam sessions — exams happen twice a year
export const IGNOU_SESSIONS = {
  JUNE: 'June',
  DECEMBER: 'December',
} as const;

// Programme types offered by IGNOU
export const PROGRAMME_TYPES = {
  BACHELOR: 'bachelor',
  MASTER: 'master',
  DIPLOMA: 'diploma',
  CERTIFICATE: 'certificate',
  PG_DIPLOMA: 'pg_diploma',
} as const;

// OTP settings
export const OTP_CODE_LENGTH = 6;
export const OTP_DEFAULT_EXPIRY_MINUTES = 5;
export const OTP_DEFAULT_MAX_ATTEMPTS = 3;

// Session settings
export const SESSION_DEFAULT_EXPIRY_HOURS = 24;
export const SESSION_COOKIE_NAME = 'sid';

// Pagination limits
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// AI Assistant limits
export const AI_MAX_CONVERSATIONS_PER_STUDENT = 50;
export const AI_MAX_MESSAGES_PER_CONVERSATION = 100;

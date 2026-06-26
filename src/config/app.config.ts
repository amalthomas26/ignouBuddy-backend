import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default('http://localhost:3001'),

  DATABASE_URL: Joi.string().uri().required().messages({
    'any.required': 'DATABASE_URL is required. Set it in .env file.',
  }),

  REDIS_URL: Joi.string().uri().optional(),

  SESSION_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'SESSION_SECRET must be at least 32 characters.',
    'any.required': 'SESSION_SECRET is required for session signing.',
  }),

  OTP_EXPIRY_MINUTES: Joi.number().min(1).max(15).default(5),
  OTP_MAX_ATTEMPTS: Joi.number().min(1).max(10).default(3),
  OTP_RATE_LIMIT_WINDOW_MINUTES: Joi.number().min(1).default(15),
  OTP_RATE_LIMIT_MAX_COUNT: Joi.number().min(1).default(5),

  GMAIL_CLIENT_ID: Joi.string().optional(),
  GMAIL_CLIENT_SECRET: Joi.string().optional(),
  GMAIL_REFRESH_TOKEN: Joi.string().optional(),
  GMAIL_USER: Joi.string().email().optional(),

  GEMINI_API_KEY: Joi.string().optional(),
});

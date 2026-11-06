/**
 * Constants that describe the HTTP transport, not the application domain.
 * Shared because admin and storefront must agree on status codes and environment names.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const MESSAGES = {
  NEXT_URL_IS_INVALID: "NEXT_PUBLIC_APP_URL is invalid",
  DOTENV_FILE_CONFIG_INVALID: "Environment configuration is invalid",
} as const;

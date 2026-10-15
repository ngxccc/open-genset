/**
 * Centralized company and operational contact configurations.
 * Prevents hardcoding business identity and contact details inside translation strings.
 */
export const COMPANY_CONFIG = {
  BRAND_NAME: "OpenGenset",
  LEGAL_NAME: "OpenGenset Industrial Solutions Co., Ltd.",
  DEFAULT_ADMIN_EMAIL: "admin@opengenset.io",
  SUPPORT_EMAIL: "support@opengenset.io",
  HOTLINES: {
    HCM: "0901.49.7771",
    HN: "0979.778.779",
  },
  CONSOLE_VERSION: "v1.4.2",
} as const;

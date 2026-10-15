import { env } from "@/env";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const siteConfig = {
  name: "OpenGenset | Nền Tảng Thương Mại Máy Phát Điện & IoT Telemetry",
  shortName: "OpenGenset",
  description:
    "Hệ thống thương mại điện tử B2B và nền tảng giám sát thông minh thiết bị máy phát điện công nghiệp ứng dụng IoT.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/opengraph-image.jpg`,
  keywords: [
    "OpenGenset",
    "Máy phát điện công nghiệp",
    "Máy phát điện 3 pha",
    "Báo giá B2B máy phát điện",
    "IoT Telemetry",
    "Giải pháp nguồn điện",
  ],
  links: {
    github: "https://github.com/ngocdev/open-genset",
  },
} as const;

export type SiteConfig = typeof siteConfig;

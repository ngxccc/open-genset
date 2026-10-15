import { env } from "@/env";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const siteConfig = {
  name: "OpenGenset Admin Portal",
  shortName: "OpenGenset",
  portalTitle: "OpenGenset",
  portalSubtitle: "B2B Admin Portal",
  description:
    "Hệ thống quản trị thương mại điện tử B2B và nền tảng giám sát thông minh thiết bị máy phát điện công nghiệp OpenGenset.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/opengraph-image.jpg`,
  keywords: [
    "Máy phát điện Hyundai",
    "Máy phát điện công nghiệp",
    "Máy phát điện 3 pha",
    "Máy phát điện gia đình",
    "Giải pháp nguồn điện",
    "Bảo trì máy phát điện",
  ],
  links: {
    github: "https://github.com/ngocdev/open-genset",
  },
} as const;

export type SiteConfig = typeof siteConfig;

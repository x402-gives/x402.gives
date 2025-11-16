import { baseUrl } from "@/config/app";

export type SeoConfig = {
  siteName: string;
  titleTemplate: string; // use %s as placeholder for page title
  defaultTitle: string;
  description: string;
  openGraph: {
    type: "website" | "article";
    locale?: string;
  };
  twitter: {
    card: string;
    site?: string;
    creator?: string;
  };
};

export const seoConfig: SeoConfig = {
  siteName: "x402.gives",
  titleTemplate: "%s | x402.gives",
  defaultTitle: "x402.gives",
  description: "Open-source donation platform for creators using x402 protocol.",
  openGraph: {
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
  },
};

export function absoluteUrl(path?: string) {
  if (!path) return baseUrl;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

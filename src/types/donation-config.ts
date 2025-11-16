import type { Address } from "viem";
import { X402_CONFIG_PATH } from "../constants/config";

/**
 * X402 donation page configuration
 * Common to all scenarios: GitHub, QuickLink, Custom
 */
export interface X402DonationConfig {
  // ============ Required/Optional Fields ============
  /**
   * Primary recipient address (optional for unverified scenarios)
   * This is the main address that receives donations.
   * If recipients array is provided, payTo receives the remainder after splits.
   * If recipients array is empty or not provided, payTo receives 100% of donations.
   *
   * Note: payTo is optional to support scenarios where configuration doesn't exist yet
   * (e.g., GitHub repo without config file). In such cases, UI should prompt for address.
   */
  payTo?: Address;

  // ============ Optional Fields ============
  /**
   * List of additional recipients for split payments (optional)
   * Used for distributed transfers when multiple recipients are needed.
   * Each recipient gets a percentage specified by bips (basis points).
   * Total bips must be <= 10000 (100%).
   * Remaining amount (if totalBips < 10000) goes to payTo.
   */
  recipients?: Array<{
    address: Address;
    bips: number; // 0-10000 (basis points)
  }>;

  // ============ Display Information ============
  /**
   * Title/Project name
   * - GitHub: repo name, e.g., "react", "next.js"
   * - QuickLink: user-defined, e.g., "Support My Work"
   * - Fallback: address abbreviation, e.g., "0x123...456"
   */
  title?: string;

  /**
   * Description
   * Explains donation purpose or project introduction
   */
  description?: string;

  /**
   * Creator/Owner information (optional)
   * Used to display "whose donation page this is"
   */
  creator?: {
    handle: string; // @username, required
    avatar?: string; // Avatar URL
  };

  // ============ Configuration Options ============
  defaultAmount?: string;

  /**
   * Supported networks for this recipient (optional)
   * - If specified: Only allow donations on the listed network(s)
   *   Use this for contract addresses that differ across networks
   * - If omitted: Allow all supported networks (suitable for EOA addresses)
   *
   * Examples:
   * - Single network: "base" or ["base"]
   * - Multiple networks: ["base", "base-sepolia"]
   * - All networks: undefined or null
   */
  network?: string | string[];

  /**
   * Related links
   * Simple URL array, type automatically identified by URL
   */
  links?: Array<{
    url: string;
    label?: string; // Optional display label, e.g., "Documentation", "Community"
  }>;
}

/**
 * GitHub User API interface
 */
export interface GitHubUser {
  login: string; // "facebook"
  name: string; // "Meta Open Source"
  avatar_url: string; // "https://github.com/facebook.png"
  bio: string | null; // "We build React"
  html_url: string; // "https://github.com/facebook"
  blog: string | null; // "https://opensource.fb.com"
  twitter_username: string | null; // "fbOpenSource"
  email: string | null; // "opensource@fb.com"
}

/**
 * GitHub Repository API interface
 */
export interface GitHubRepo {
  name: string; // "react"
  full_name: string; // "facebook/react"
  description: string | null; // "A declarative..."
  html_url: string; // "https://github.com/facebook/react"
  homepage: string | null; // "https://react.dev"
  stargazers_count?: number; // Star count
  forks_count?: number; // Fork count
}

/**
 * Complete data structure used for page rendering
 * Built in useRecipient hook
 */
export interface RecipientPageData {
  // Core configuration (from config file or URL)
  config: X402DonationConfig;

  // Runtime metadata (dynamically fetched during page rendering)
  metadata: {
    // Source information
    source: {
      type: "github" | "quicklink" | "custom";
      reference: string; // e.g., "github.com/user/repo/.x402/donation.json" or "0x123...456#config"
      verified: boolean; // Whether verified (GitHub config file exists = verified)
    };

    // GitHub-specific: User information fetched from API (used to supplement config)
    githubUser?: GitHubUser;

    // GitHub-specific: Repository information fetched from API (used to supplement config)
    githubRepo?: GitHubRepo;
  };
}

/**
 * Merged data structure used for display
 */
export interface DisplayData {
  // Merged display fields
  title: string;
  description?: string;
  creator?: {
    handle: string;
    avatar?: string;
  };
  recipients: Array<{
    address: Address;
    bips: number;
  }>; // Always an array for display (empty if no recipients)
  links?: Array<{
    url: string;
    label?: string;
  }>;
  defaultAmount?: string;
  network?: string | string[];

  // Source information
  source: RecipientPageData["metadata"]["source"];
}

/**
 * Automatically identify link type based on URL
 */
export function detectLinkType(url: string): string {
  const urlLower = url.toLowerCase();

  // GitHub/GitLab repositories
  if (urlLower.includes("github.com") || urlLower.includes("gitlab.com")) {
    return "repository";
  }

  // Social media
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
    return "twitter";
  }
  if (urlLower.includes("discord.gg") || urlLower.includes("discord.com")) {
    return "discord";
  }
  if (urlLower.includes("t.me") || urlLower.includes("telegram.")) {
    return "telegram";
  }

  // Email
  if (urlLower.startsWith("mailto:")) {
    return "email";
  }

  // Documentation (common patterns)
  if (
    urlLower.includes("/docs") ||
    urlLower.includes("/documentation") ||
    urlLower.includes("docs.")
  ) {
    return "documentation";
  }

  // Blog (common patterns)
  if (urlLower.includes("/blog") || urlLower.includes("blog.") || urlLower.includes("medium.com")) {
    return "blog";
  }

  // Default to website
  return "website";
}

/**
 * Icons corresponding to link types
 */
export const linkIcons = {
  website: "🌐",
  repository: "📦",
  documentation: "📖",
  twitter: "🐦",
  discord: "💬",
  telegram: "✈️",
  blog: "📝",
  email: "📧",
};

/**
 * Merge link information
 */
export function mergeLinks(
  configLinks: X402DonationConfig["links"],
  metadata: RecipientPageData["metadata"],
): X402DonationConfig["links"] {
  const links: Array<{ url: string; label?: string }> = [...(configLinks || [])];

  // In GitHub scenario, supplement GitHub information
  if (metadata.source.type === "github") {
    // If repository is not in config, supplement GitHub repo URL
    if (metadata.githubRepo && !configLinks?.some((l) => l.url === metadata.githubRepo!.html_url)) {
      links.push({
        url: metadata.githubRepo.html_url,
        label: "Repository",
      });
    }

    // If website is not in config, supplement repo homepage or user blog
    const websiteUrl = metadata.githubRepo?.homepage || metadata.githubUser?.blog;
    if (websiteUrl && !configLinks?.some((l) => l.url === websiteUrl)) {
      links.push({
        url: websiteUrl,
        label: "Website",
      });
    }
  }

  return links;
}

/**
 * When rendering in RecipientCard, merge config and metadata
 */
export function getDisplayData(data: RecipientPageData): DisplayData {
  const { config, metadata } = data;

  // Build recipients array for display
  // Include additional recipients from config.recipients
  const displayRecipients: Array<{ address: Address; bips: number }> = [];

  if (config.recipients && config.recipients.length > 0) {
    // Add additional recipients
    displayRecipients.push(...config.recipients);
  }

  // Note: payTo is handled separately in TransferHook, but for display purposes
  // we show it as part of recipients if there are no additional recipients
  // or calculate its percentage if there are additional recipients
  // The actual payTo address is stored in config.payTo and used by the payment flow

  return {
    // Title: priority config.title > repo.name > user.login > address
    title:
      config.title ||
      metadata.githubRepo?.name ||
      metadata.githubUser?.login ||
      metadata.source.reference,

    // Description: priority config.description > repo.description > user.bio
    description:
      config.description ||
      metadata.githubRepo?.description ||
      (metadata.githubUser?.bio ?? undefined),

    // Creator: priority config.creator > GitHub user info
    creator:
      config.creator ||
      (metadata.githubUser
        ? {
            handle: metadata.githubUser.login,
            avatar: metadata.githubUser.avatar_url,
          }
        : undefined),

    // Links: merge links from config and GitHub information
    links: mergeLinks(config.links, metadata),

    // Recipients for display (additional recipients only, payTo is handled separately)
    recipients: displayRecipients,
    defaultAmount: config.defaultAmount,
    network: config.network,

    // Source information comes from metadata
    source: metadata.source,
  };
}

/**
 * Data construction for GitHub scenario with config file
 */
export function buildGitHubDataWithFile(
  configFile: X402DonationConfig,
  githubUser: GitHubUser,
  githubRepo?: GitHubRepo,
): RecipientPageData {
  // 1. Base configuration directly from config file
  const config: X402DonationConfig = {
    payTo: configFile.payTo,
    title: configFile.title,
    description: configFile.description,
    recipients: configFile.recipients,
    defaultAmount: configFile.defaultAmount,
    network: configFile.network,
    creator: configFile.creator,
    links: configFile.links,
  };

  // 2. Metadata
  const metadata: RecipientPageData["metadata"] = {
    source: {
      type: "github",
      reference: githubRepo
        ? `github.com/${githubRepo.full_name}/${X402_CONFIG_PATH}`
        : `github.com/${githubUser.login}/${X402_CONFIG_PATH}`,
      verified: true,
    },
    githubUser,
    githubRepo,
  };

  return { config, metadata };
}

/**
 * Data construction for GitHub scenario without config file
 */
export function buildGitHubDataWithoutFile(
  githubUser: GitHubUser,
  githubRepo?: GitHubRepo,
): RecipientPageData {
  // 1. Config file doesn't exist, only provide minimal config
  // Note: payTo is not set (undefined) to trigger the "no config" UI state
  // This will be handled by RecipientCard to show the configuration prompt
  const config: X402DonationConfig = {
    // Don't set payTo - leave it undefined to indicate no configuration exists
    // recipients is optional, not set here
    // Other fields are not filled, let rendering supplement from metadata
  };

  // 2. Metadata
  const metadata: RecipientPageData["metadata"] = {
    source: {
      type: "github",
      reference: githubRepo
        ? `github.com/${githubRepo.full_name}/${X402_CONFIG_PATH}`
        : `github.com/${githubUser.login}/${X402_CONFIG_PATH}`,
      verified: false,
    },
    githubUser,
    githubRepo,
  };

  return { config, metadata };
}

/**
 * Data construction for QuickLink scenario
 */
export function buildQuickLinkData(
  config: X402DonationConfig,
  reference: string,
): RecipientPageData {
  return {
    config,
    metadata: {
      source: {
        type: "quicklink",
        reference,
        verified: false, // QuickLink scenario defaults to unverified
      },
    },
  };
}

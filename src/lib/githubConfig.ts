import type { Address } from "viem";
import type { X402DonationConfig } from "../types/donation-config";
import { X402_CONFIG_DIR, X402_CONFIG_PATH } from "../constants/config";

export interface GitHubUserInfo {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

export interface ResolvedGitHubConfig {
  config: X402DonationConfig;
  userInfo: GitHubUserInfo;
  source: string; // e.g., "github.com/jolestar/.x402/donation.json"
  verified: boolean;
}

/**
 * Fetch GitHub user information
 */
export async function fetchGitHubUserInfo(username: string): Promise<GitHubUserInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub user info:", error);
    return null;
  }
}

/**
 * Read x402 configuration file from GitHub
 * @param username GitHub username
 * @param repo Optional repository name
 * @param bypassCache If true, adds a cache-busting parameter to force fresh fetch
 */
export async function fetchGitHubConfig(
  username: string,
  repo?: string,
  bypassCache = false,
): Promise<ResolvedGitHubConfig | null> {
  try {
    const targetRepo = repo ?? username; // user-level configs live in <username>/<username>

    // Build configuration file URL
    const baseUrl = `https://raw.githubusercontent.com/${username}/${targetRepo}/main`;
    let configUrl = `${baseUrl}/${X402_CONFIG_PATH}`;

    // Add cache-busting parameter if requested
    if (bypassCache) {
      configUrl += `?t=${Date.now()}`;
    }

    // Fetch both configuration file and user information simultaneously
    const [configResponse, userResponse] = await Promise.all([
      fetch(configUrl),
      fetch(`https://api.github.com/users/${username}`),
    ]);

    // Check response status
    if (!configResponse.ok || !userResponse.ok) {
      return null;
    }

    // Parse data
    const config: X402DonationConfig = await configResponse.json();
    const userInfo: GitHubUserInfo = await userResponse.json();

    // Validate configuration - payTo is required
    if (!config.payTo) {
      return null; // Must have payTo address
    }

    const source = `github.com/${username}/${targetRepo}/${X402_CONFIG_PATH}`;

    return {
      config,
      userInfo,
      source,
      verified: true,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub config:", error);
    return null;
  }
}

/**
 * Resolve recipient addresses from GitHub configuration
 * Returns array of recipients including payTo and any additional recipients
 */
export function resolveRecipients(
  config: X402DonationConfig,
): Array<{ address: Address; bips: number }> {
  const recipients: Array<{ address: Address; bips: number }> = [];

  // Add additional recipients if any
  if (config.recipients && config.recipients.length > 0) {
    // Validate total bips
    const totalBips = config.recipients.reduce((sum, r) => sum + r.bips, 0);
    if (totalBips <= 10000) {
      recipients.push(
        ...config.recipients.map((r) => ({
          address: r.address as Address,
          bips: r.bips,
        })),
      );
    }
  }

  // payTo is always included (it's required)
  // If recipients exist and totalBips < 10000, payTo gets remainder
  // If no recipients, payTo gets 100%
  return recipients;
}

/**
 * Resolve default amount
 */
export function resolveDefaultAmount(config: X402DonationConfig): string | undefined {
  return config.defaultAmount;
}

/**
 * Check if string starts with $ (dollar amount)
 */
export function isDollarAmount(amount: string): boolean {
  return amount.startsWith("$");
}

/**
 * Convert dollar amount to USDC atomic units
 */
export function dollarToUsdcAtomic(dollarAmount: string): string {
  const dollars = parseFloat(dollarAmount.replace("$", ""));
  const usdcAtomic = dollars * 1000000; // USDC 6 decimals
  return usdcAtomic.toString();
}

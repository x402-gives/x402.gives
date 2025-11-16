import type { Address } from "viem";
import type { X402DonationConfig } from "../types/donation-config";

/**
 * Encode X402DonationConfig to base64 string for URL hash fragment
 */
export function encodeConfigToHash(config: X402DonationConfig): string {
  try {
    const jsonString = JSON.stringify(config);
    const base64 = btoa(encodeURIComponent(jsonString));
    return base64;
  } catch (error) {
    console.error("Failed to encode config:", error);
    throw new Error("Invalid configuration format");
  }
}

/**
 * Decode base64 string from URL hash fragment to X402DonationConfig
 */
export function decodeConfigFromHash(hash: string): X402DonationConfig | null {
  if (!hash || hash.length === 0) {
    return null;
  }

  try {
    const jsonString = decodeURIComponent(atob(hash));
    const config: X402DonationConfig = JSON.parse(jsonString);
    return config;
  } catch (error) {
    console.error("Failed to decode config from hash:", error);
    return null;
  }
}

/**
 * Validate X402DonationConfig
 */
export function validateConfig(config: X402DonationConfig): boolean {
  // payTo is required
  if (!config.payTo) {
    return false;
  }

  // If recipients exist, validate bips
  if (config.recipients && config.recipients.length > 0) {
    const totalBips = config.recipients.reduce((sum, r) => sum + r.bips, 0);
    if (totalBips > 10000) {
      return false; // Total bips cannot exceed 100%
    }

    // Validate each recipient
    for (const recipient of config.recipients) {
      if (!recipient.address || recipient.bips < 0) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Resolve QuickLink config to recipients array
 * Returns array of additional recipients (payTo is handled separately)
 */
export function resolveQuickLinkRecipients(
  config: X402DonationConfig,
): Array<{ address: Address; bips: number }> {
  // Return additional recipients if any
  if (config.recipients && config.recipients.length > 0) {
    // Validate total bips
    const totalBips = config.recipients.reduce((sum, r) => sum + r.bips, 0);
    if (totalBips <= 10000) {
      return config.recipients.map((r) => ({
        address: r.address as Address,
        bips: r.bips,
      }));
    }
  }

  return [];
}

/**
 * Create QuickLink config from URL path (address) and hash
 */
export function createQuickLinkConfig(address: string, hash: string): X402DonationConfig | null {
  // Decode config from hash
  const config = decodeConfigFromHash(hash);

  if (!config) {
    // No config in hash, create default config with payTo
    return {
      payTo: address as Address,
    };
  }

  // Ensure payTo is set to the address from URL
  config.payTo = address as Address;

  return config;
}

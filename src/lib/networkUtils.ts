import type { X402DonationConfig } from "../types/donation-config";
import { Network, NETWORKS, getAvailableNetworks } from "../config/networks";

/**
 * Normalize network config to array format
 * Converts string to array, or returns array as-is
 */
export function normalizeNetworkConfig(network: X402DonationConfig["network"]): string[] {
  if (!network) {
    return [];
  }
  if (typeof network === "string") {
    return [network];
  }
  return network;
}

/**
 * Get configured networks from donation config
 * Returns empty array if not configured
 */
export function getConfiguredNetworks(config: X402DonationConfig): string[] {
  return normalizeNetworkConfig(config.network);
}

/**
 * Get selectable networks based on config and environment
 * - If config specifies networks: returns intersection of configured networks and available networks
 * - If config doesn't specify: returns all available networks
 */
export function getSelectableNetworks(config: X402DonationConfig): Network[] {
  const configuredNetworks = getConfiguredNetworks(config);
  const availableNetworks = getAvailableNetworks();

  // If no network restriction in config, return all available networks
  if (configuredNetworks.length === 0) {
    return availableNetworks;
  }

  // Filter available networks to only include configured ones
  const selectable = availableNetworks.filter((network) => configuredNetworks.includes(network));

  return selectable;
}

/**
 * Validate network configuration
 * Returns true if all configured networks are valid and available
 */
export function validateNetworkConfig(config: X402DonationConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const configuredNetworks = getConfiguredNetworks(config);

  if (configuredNetworks.length === 0) {
    // No network restriction is valid
    return { valid: true, errors: [] };
  }

  // Check if all configured networks exist
  const availableNetworks = getAvailableNetworks();
  const invalidNetworks = configuredNetworks.filter(
    (network) => !availableNetworks.includes(network as Network),
  );

  if (invalidNetworks.length > 0) {
    errors.push(
      `Invalid networks: ${invalidNetworks.join(", ")}. Available networks: ${availableNetworks.join(", ")}`,
    );
  }

  // Check if any configured networks are testnets in production
  if (import.meta.env.PROD) {
    const testnetNetworks = configuredNetworks.filter((network) => {
      const networkConfig = NETWORKS[network as Network];
      return networkConfig && networkConfig.type === "testnet";
    });

    if (testnetNetworks.length > 0) {
      errors.push(
        `Testnet networks are not available in production: ${testnetNetworks.join(", ")}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

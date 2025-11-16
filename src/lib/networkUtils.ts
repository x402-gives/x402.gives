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

  // First, check if all configured networks are valid network names (check against all networks, not just available ones)
  const allNetworkNames = Object.keys(NETWORKS) as Network[];
  const invalidNetworks = configuredNetworks.filter(
    (network) => !allNetworkNames.includes(network as Network),
  );

  if (invalidNetworks.length > 0) {
    errors.push(
      `Invalid network names: ${invalidNetworks.join(", ")}. Valid networks: ${allNetworkNames.join(", ")}`,
    );
  }

  // Then, check if any configured networks are testnets in production
  // Only check valid networks to avoid duplicate error messages
  const validConfiguredNetworks = configuredNetworks.filter((network) =>
    allNetworkNames.includes(network as Network),
  );

  if (import.meta.env.PROD && validConfiguredNetworks.length > 0) {
    const testnetNetworks = validConfiguredNetworks.filter((network) => {
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

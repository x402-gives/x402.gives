/**
 * Network configuration for x402.gives - UI Layer
 *
 * This file provides network configurations for UI components and user-facing features.
 * It extends @x402x/core networks with UI-specific metadata (icons, display names, faucet URLs).
 *
 * Usage:
 * - Use this file for components that need to display network information to users
 * - Use this file for network selection UI, badges, and user preferences
 * - All core network data (chainId, settlementRouter, hooks) comes from @x402x/core
 *
 * See also: src/constants/networks.ts for facilitator/payment-related network configurations
 */

import { networks as x402Networks } from "@x402x/core";
import type { NetworkConfig as X402NetworkConfig } from "@x402x/core";

/**
 * Supported network identifiers (matching x402x/core)
 */
export type Network = keyof typeof x402Networks;

/**
 * UI-specific network configuration
 */
export interface NetworkUIConfig {
  icon: string;
  displayName: string;
  faucetUrl: string;
  blockExplorerUrl: string;
}

/**
 * Complete network configuration combining x402x data with UI metadata
 */
export interface NetworkConfig extends X402NetworkConfig, NetworkUIConfig {}

/**
 * UI configuration for supported networks
 */
export const NETWORK_UI_CONFIG: Record<Network, NetworkUIConfig> = {
  "base-sepolia": {
    icon: "🔵",
    displayName: "Base Sepolia",
    faucetUrl: "https://faucet.circle.com/",
    blockExplorerUrl: "https://sepolia.basescan.org",
  },
  "x-layer-testnet": {
    icon: "⭕",
    displayName: "X Layer Testnet",
    faucetUrl: "https://www.okx.com/xlayer/faucet",
    blockExplorerUrl: "https://www.okx.com/web3/explorer/xlayer-test",
  },
  base: {
    icon: "🔵",
    displayName: "Base Mainnet",
    faucetUrl: "https://docs.base.org/docs/tools/bridge-funds/",
    blockExplorerUrl: "https://basescan.org",
  },
  "x-layer": {
    icon: "⭕",
    displayName: "X Layer",
    faucetUrl: "https://www.okx.com/xlayer/bridge",
    blockExplorerUrl: "https://www.okx.com/web3/explorer/xlayer",
  },
};

/**
 * Complete network configurations
 * Combines x402x/core data with UI metadata
 */
export const NETWORKS: Record<Network, NetworkConfig> = {
  "base-sepolia": {
    ...x402Networks["base-sepolia"],
    ...NETWORK_UI_CONFIG["base-sepolia"],
  },
  "x-layer-testnet": {
    ...x402Networks["x-layer-testnet"],
    ...NETWORK_UI_CONFIG["x-layer-testnet"],
  },
  base: {
    ...x402Networks.base,
    ...NETWORK_UI_CONFIG.base,
  },
  "x-layer": {
    ...x402Networks["x-layer"],
    ...NETWORK_UI_CONFIG["x-layer"],
  },
};

/**
 * Get network config by chain ID
 */
export function getNetworkByChainId(chainId: number): Network | undefined {
  return Object.entries(NETWORKS).find(([_, config]) => config.chainId === chainId)?.[0] as
    | Network
    | undefined;
}

/**
 * Get network config by network name
 */
export function getNetworkConfig(network: Network): NetworkConfig {
  return NETWORKS[network];
}

/**
 * LocalStorage key for storing user's preferred network
 */
export const PREFERRED_NETWORK_KEY = "gives-preferred-network";

/**
 * Get user's preferred network from localStorage
 */
export function getPreferredNetwork(): Network | null {
  const stored = localStorage.getItem(PREFERRED_NETWORK_KEY);
  if (stored && stored in NETWORKS) {
    return stored as Network;
  }
  return null;
}

/**
 * Save user's preferred network to localStorage
 */
export function setPreferredNetwork(network: Network): void {
  localStorage.setItem(PREFERRED_NETWORK_KEY, network);
}

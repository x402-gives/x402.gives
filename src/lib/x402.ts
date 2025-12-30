import type { Address } from "viem";

import {
  X402Client,
  parseDefaultAssetAmount as parseAmount,
  formatDefaultAssetAmount as formatAmount,
} from "@x402x/client";
import { networks } from "@x402x/extensions";

export const FACILITATOR_URL = "https://facilitator.x402x.dev";

// Create X402Client instance
export function createX402Client(wallet: any, network: string): X402Client {
  return new X402Client({
    wallet,
    network,
    facilitatorUrl: FACILITATOR_URL,
    timeout: 30000,
    confirmationTimeout: 60000,
  });
}

// Re-export amount parsing functions
export const parseDefaultAssetAmount = parseAmount;
export const formatDefaultAssetAmount = formatAmount;

// Convert percentage to basis points (bips)
export function percentageToBips(percentage: number): number {
  return Math.round(percentage * 100);
}

// Convert basis points to percentage
export function bipsToPercentage(bips: number): number {
  return bips / 100;
}

// Get TransferHook address for network
export function getTransferHookAddress(network: string): Address {
  const networkConfig = networks[network as keyof typeof networks];
  if (!networkConfig) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return networkConfig.hooks.transfer as Address;
}

// Encode recipients for TransferHook
export function encodeRecipientsForHook(
  recipients: Array<{ address: Address; bips: number }>,
): `0x${string}` {
  // Filter out recipients with 0 bips (they don't need to be in hookData)
  const activeRecipients = recipients.filter((r) => r.bips > 0);

  if (activeRecipients.length <= 1) {
    // Only one recipient or all others are 0 - use simple transfer
    return "0x";
  }

  // Multiple recipients - encode for distributed transfer
  // For now, return empty data - the actual encoding will be handled by x402x/core
  return "0x";
}

// Get primary recipient (the one who gets remaining bips)
export function getPrimaryRecipient(
  recipients: Array<{ address: Address; bips: number }>,
): Address {
  return recipients[0]?.address || "0x0000000000000000000000000000000000000000";
}

// Validate recipient configuration
export function validateRecipientConfig(
  recipients: Array<{ address: Address; bips: number }>,
): boolean {
  if (recipients.length === 0) return false;

  const totalBips = recipients.reduce((sum, r) => sum + r.bips, 0);
  return totalBips <= 10000; // Total bips must be <= 10000 (100%)
}

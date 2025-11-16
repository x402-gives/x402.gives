/**
 * Network Switch Hook for x402.gives
 * Provides functionality to switch wallet to a specific network using Wagmi's useSwitchChain
 */

import { useCallback } from "react";
import { useSwitchChain } from "wagmi";
import { Network, NETWORKS } from "../config/networks";

export function useNetworkSwitch() {
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  /**
   * Switch wallet to specified network
   */
  const switchToNetwork = useCallback(
    async (network: Network): Promise<boolean> => {
      const config = NETWORKS[network];

      try {
        console.log(`[Network] Switching to ${config.displayName} (chainId: ${config.chainId})...`);

        await switchChain({ chainId: config.chainId });

        console.log(`[Network] Successfully switched to ${config.displayName}`);
        return true;
      } catch (error: any) {
        console.error("[Network] Error switching network:", error);

        // User rejected the request
        if (error.code === 4001 || error.message?.includes("User rejected")) {
          console.log("[Network] User rejected network switch");
        } else {
          console.error(
            `Failed to switch to ${config.displayName}:`,
            error.message || "Unknown error",
          );
        }

        return false;
      }
    },
    [switchChain],
  );

  return {
    switchToNetwork,
    isSwitching,
  };
}

import { useCallback, useState } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import {
  createX402Client,
  encodeRecipientsForHook,
  getPrimaryRecipient,
  getTransferHookAddress,
  parseDefaultAssetAmount,
  validateRecipientConfig,
} from "../lib/x402";
import type { Recipient } from "./useRecipient";

export type PaymentStatus = "idle" | "preparing" | "signing" | "submitting" | "success" | "error";

export interface UseX402PaymentOptions {
  network?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function useX402Payment(options: UseX402PaymentOptions = {}) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient();

  const execute = useCallback(
    async (
      amount: string, // Display amount (e.g., "5.00" for $5)
      recipients: Recipient[],
      network = "base-sepolia",
      facilitatorFee?: string, // Optional: pre-calculated facilitator fee
    ) => {
      if (!isConnected || !address) {
        const errorMsg = "Please connect your wallet first";
        setError(errorMsg);
        setStatus("error");
        options.onError?.(new Error(errorMsg));
        return;
      }

      if (!connectorClient) {
        const errorMsg = "Wallet client not available";
        setError(errorMsg);
        setStatus("error");
        options.onError?.(new Error(errorMsg));
        return;
      }

      // Validate recipient configuration
      if (!validateRecipientConfig(recipients)) {
        const errorMsg = "Invalid recipient configuration";
        setError(errorMsg);
        setStatus("error");
        options.onError?.(new Error(errorMsg));
        return;
      }

      setStatus("preparing");
      setError("");
      setResult(null);

      try {
        console.log("🎁 Starting donation:", {
          amount: `${amount} USDC`,
          recipients,
          network,
          facilitatorFee: facilitatorFee || "undefined (will query)",
        });

        // Parse amount using x402's parseDefaultAssetAmount
        const atomicAmount = parseDefaultAssetAmount(amount, network as any);

        // Create X402Client instance
        console.log("🔧 Creating X402Client...");
        const client = await createX402Client(connectorClient, network);
        console.log("✅ X402Client created");

        // Encode recipients for TransferHook
        const hookData = encodeRecipientsForHook(recipients);
        const hookAddress = getTransferHookAddress(network);
        const payTo = getPrimaryRecipient(recipients);

        console.log("💼 Prepared settlement:", {
          amount: atomicAmount,
          payTo,
          hookAddress,
          hookData,
          facilitatorFee: facilitatorFee || "will be queried by client",
        });

        // Set status to signing before execute
        setStatus("signing");

        // Execute payment through X402Client
        // Note: client.execute() will automatically:
        // 1. Get USDC token address for the network
        // 2. Query facilitator fee if not provided
        // 3. Sign the authorization
        // 4. Submit to facilitator
        console.log("📡 Calling client.execute()...");
        const executeResult = await client.execute(
          {
            amount: atomicAmount,
            payTo,
            hook: hookAddress,
            hookData,
            facilitatorFee, // Use provided fee or let client query it
          },
          false,
        ); // Don't wait for confirmation

        console.log("📝 Transaction submitted:", executeResult.txHash);
        console.log("Full execute result:", executeResult);
        setStatus("submitting");

        // Optionally wait for confirmation
        // For better UX, we show success immediately and don't wait for on-chain confirmation
        const finalResult = {
          txHash: executeResult.txHash,
          network,
          payer: address,
          receipt: executeResult.receipt,
          settlement: {
            amount: atomicAmount,
            payTo,
          },
        };

        console.log("✅ Donation successful:", finalResult);

        setResult(finalResult);
        setStatus("success");
        options.onSuccess?.(finalResult);
      } catch (err) {
        console.error("❌ Donation failed:", err);
        const errorMsg = err instanceof Error ? err.message : "Donation failed";
        setError(errorMsg);
        setStatus("error");
        options.onError?.(err instanceof Error ? err : new Error(errorMsg));
      }
    },
    [isConnected, address, connectorClient, options],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError("");
    setResult(null);
  }, []);

  return {
    execute,
    reset,
    status,
    error,
    result,
    isConnected,
  };
}

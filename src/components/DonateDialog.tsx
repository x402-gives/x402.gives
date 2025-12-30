/**
 * Donate Dialog Component for x402.gives
 * Complete donation flow: network selection → wallet connection → fee display → payment confirmation
 */

import { useState, useEffect, useMemo } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { FeeCalculationResult } from "@x402x/client";
import { useNetworkSwitch } from "../hooks/useNetworkSwitch";
import { Network, NETWORKS, getPreferredNetwork, setPreferredNetwork } from "../config/networks";
import {
  createX402Client,
  parseDefaultAssetAmount,
  formatDefaultAssetAmount,
  encodeRecipientsForHook,
} from "../lib/x402";
import { getSelectableNetworks } from "../lib/networkUtils";
import type { Recipient } from "../hooks/useRecipient";
import type { Address } from "viem";
import type { X402DonationConfig } from "../types/donation-config";

type PaymentStep =
  | "select-network"
  | "switch-network"
  | "loading-fee"
  | "confirm-payment"
  | "processing"
  | "success";

interface DonateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  recipients: Recipient[];
  payTo?: Address;
  config?: X402DonationConfig;
  onSuccess?: (result: { txHash: string; network: Network; facilitatorFee?: string }) => void;
  onError?: (error: string) => void;
}

export function DonateDialog({
  isOpen,
  onClose,
  amount,
  recipients,
  payTo,
  config,
  onSuccess,
  onError,
}: DonateDialogProps) {
  const [step, setStep] = useState<PaymentStep>("select-network");
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [feeInfo, setFeeInfo] = useState<FeeCalculationResult | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [displayFee, setDisplayFee] = useState<string>("");
  const [displayTotal, setDisplayTotal] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isManualNetworkSelection, setIsManualNetworkSelection] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { data: connectorClient } = useConnectorClient();
  const { switchToNetwork, isSwitching } = useNetworkSwitch();
  const { open } = useAppKit();

  // Calculate display amounts when amount or feeInfo changes
  useEffect(() => {
    const updateDisplayAmounts = async () => {
      try {
        // Log the incoming amount for debugging
        console.log("[DonateDialog] Incoming amount:", amount);

        // amount is in dollar format (e.g., "5" or "$5")
        // Normalize by removing $ prefix
        const normalizedAmount = amount.replace(/^\$\s*/, "");
        setDisplayAmount(normalizedAmount);

        if (feeInfo && selectedNetwork) {
          const atomicAmount = parseDefaultAssetAmount(normalizedAmount, selectedNetwork as any);
          console.log("[DonateDialog] Parsed atomic amount:", atomicAmount);

          const fee = formatDefaultAssetAmount(feeInfo.facilitatorFee, selectedNetwork as any);
          setDisplayFee(fee);

          const totalAtomic = (BigInt(atomicAmount) + BigInt(feeInfo.facilitatorFee)).toString();
          console.log("[DonateDialog] Total atomic amount:", totalAtomic);

          const total = formatDefaultAssetAmount(totalAtomic, selectedNetwork as any);
          setDisplayTotal(total);
        } else {
          setDisplayFee("");
          setDisplayTotal(normalizedAmount);
        }
      } catch (err) {
        console.error("Error calculating display amounts:", err);
      }
    };

    updateDisplayAmounts();
  }, [amount, feeInfo, selectedNetwork]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedNetwork(null);
      setFeeInfo(null);
      setError(null);
      setIsPaying(false);
      setTxHash(null);
      setStep("select-network");
      setIsManualNetworkSelection(false);
    }
  }, [isOpen]);

  // Get selectable networks based on config
  const selectableNetworks = useMemo(
    () => (config ? getSelectableNetworks(config) : (Object.keys(NETWORKS) as Network[])),
    [config],
  );
  const hasNetworkRestriction = config?.network !== undefined && config.network !== null;
  const canChangeNetwork = selectableNetworks.length > 1;

  // Load preferred network or auto-select if only one network available
  useEffect(() => {
    if (!isOpen) return;

    if (selectableNetworks.length === 1) {
      // Auto-select if only one network is available
      setSelectedNetwork(selectableNetworks[0]);
      setPreferredNetwork(selectableNetworks[0]);
      setIsManualNetworkSelection(false);
      return;
    }

    if (!isManualNetworkSelection) {
      const preferred = getPreferredNetwork();
      // Only use preferred if it's in the selectable networks
      if (preferred && selectableNetworks.includes(preferred)) {
        setSelectedNetwork(preferred);
      }
    }
  }, [isOpen, selectableNetworks, isManualNetworkSelection]);

  // Auto-continue flow after wallet connection
  useEffect(() => {
    if (isConnected && selectedNetwork && step === "select-network" && connectorClient) {
      const targetChainId = NETWORKS[selectedNetwork].chainId;
      if (chain?.id !== targetChainId) {
        setStep("switch-network");
      } else {
        setStep("loading-fee");
        loadFee(selectedNetwork);
      }
    }
  }, [isConnected, selectedNetwork, chain, step, connectorClient]);

  // Handle network switching
  useEffect(() => {
    if (step === "switch-network" && selectedNetwork && isConnected) {
      const switchNetwork = async () => {
        const success = await switchToNetwork(selectedNetwork);
        if (success) {
          setStep("loading-fee");
          await loadFee(selectedNetwork);
        } else {
          setError(`Failed to switch to ${NETWORKS[selectedNetwork].displayName}`);
          setStep("select-network");
        }
      };
      switchNetwork();
    }
  }, [step, selectedNetwork, isConnected, switchToNetwork]);

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setPreferredNetwork(network);
    setError(null);
    setIsManualNetworkSelection(false);

    if (!isConnected) {
      // Open AppKit modal to connect wallet
      open();
      return;
    }

    const targetChainId = NETWORKS[network].chainId;
    if (chain?.id !== targetChainId) {
      setStep("switch-network");
    } else {
      setStep("loading-fee");
      loadFee(network);
    }
  };

  const loadFee = async (network: Network) => {
    if (!connectorClient || !address) {
      console.log("[DonateDialog] Client or address not ready, waiting...");
      return;
    }

    try {
      console.log("[DonateDialog] Loading fee for network:", network);

      const client = createX402Client(connectorClient, network);
      const networkConfig = NETWORKS[network];
      const hookData = encodeRecipientsForHook(recipients);
      const hookAddress = networkConfig.hooks.transfer as `0x${string}`;

      const fee = await client.calculateFee(hookAddress, hookData);
      console.log("[DonateDialog] Fee loaded:", fee);

      setFeeInfo(fee);
      setStep("confirm-payment");
    } catch (err: any) {
      console.error("[DonateDialog] Failed to load fee:", err);
      setError(err.message || "Failed to load facilitator fee");
      setStep("select-network");
    }
  };

  const handlePay = async () => {
    if (!connectorClient || !selectedNetwork || !feeInfo || !payTo) {
      return;
    }

    setIsPaying(true);
    setError(null);
    setStep("processing");

    try {
      const client = createX402Client(connectorClient, selectedNetwork);
      const networkConfig = NETWORKS[selectedNetwork];
      const hookData = encodeRecipientsForHook(recipients);
      const hookAddress = networkConfig.hooks.transfer as `0x${string}`;

      // Normalize amount: remove $ prefix
      const normalizedAmount = amount.replace(/^\$\s*/, "");
      console.log("[DonateDialog] handlePay - normalized amount:", normalizedAmount);

      // Convert USD amount to atomic units before passing to client.execute()
      // client.execute() now requires atomic units (no automatic conversion)
      const atomicAmount = parseDefaultAssetAmount(normalizedAmount, selectedNetwork as any);
      console.log("[DonateDialog] handlePay - atomic amount:", atomicAmount);

      const result = await client.execute(
        {
          hook: hookAddress,
          hookData,
          amount: atomicAmount, // Must be atomic units
          payTo: payTo as `0x${string}`,
          facilitatorFee: feeInfo.facilitatorFee,
        },
        false,
      );

      console.log("[DonateDialog] Payment successful:", result);
      setTxHash(result.txHash);
      setStep("success");

      onSuccess?.({
        txHash: result.txHash,
        network: selectedNetwork,
        facilitatorFee: feeInfo.facilitatorFee,
      });
    } catch (err: any) {
      console.error("[DonateDialog] Payment failed:", err);
      const errorMsg = err.message || "Payment failed";
      setError(errorMsg);
      setStep("confirm-payment");
      onError?.(errorMsg);
    } finally {
      setIsPaying(false);
    }
  };

  const handleClose = () => {
    if (!isPaying) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleClose}
      >
        {/* Dialog */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {!isPaying && (
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                padding: "5px 10px",
                lineHeight: "1",
              }}
              title="Close"
            >
              ×
            </button>
          )}

          {/* Step 1: Network Selection */}
          {step === "select-network" && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: "10px", color: "#333" }}>
                🌐 Select Payment Network
              </h2>
              <p style={{ marginBottom: "25px", color: "#666", fontSize: "14px" }}>
                {isConnected
                  ? `Choose the blockchain network for your $${displayAmount} USDC donation`
                  : `Choose a network to get started (wallet connection will be requested next)`}
              </p>

              {hasNetworkRestriction && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "12px 15px",
                    backgroundColor: "#fef3c7",
                    borderRadius: "8px",
                    border: "1px solid #fcd34d",
                    fontSize: "13px",
                    color: "#92400e",
                  }}
                >
                  ℹ️ This recipient only accepts donations on:{" "}
                  {selectableNetworks.map((n) => NETWORKS[n].displayName).join(", ")}
                </div>
              )}

              {selectableNetworks.length === 0 && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fee",
                    borderRadius: "8px",
                    border: "1px solid #fcc",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#c00" }}>
                    ❌ No available networks. The configured networks are not available in this
                    environment.
                  </div>
                </div>
              )}

              {error && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fee",
                    borderRadius: "8px",
                    border: "1px solid #fcc",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#c00" }}>❌ {error}</div>
                </div>
              )}

              {selectableNetworks.length === 1 && selectedNetwork ? (
                // Single network: show as read-only
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    padding: "18px 20px",
                    border: "2px solid #3b82f6",
                    borderRadius: "10px",
                    backgroundColor: "#f0f9ff",
                    textAlign: "left",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>{NETWORKS[selectedNetwork].icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "#111", marginBottom: "2px" }}>
                      {NETWORKS[selectedNetwork].displayName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {NETWORKS[selectedNetwork].name}
                    </div>
                  </div>
                  <span style={{ color: "#3b82f6", fontSize: "20px" }}>✓</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectableNetworks.map((networkKey) => {
                    const networkConfig = NETWORKS[networkKey];
                    return (
                      <button
                        key={networkKey}
                        onClick={() => handleNetworkSelect(networkKey)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          padding: "18px 20px",
                          border:
                            selectedNetwork === networkKey
                              ? "2px solid #3b82f6"
                              : "2px solid #e5e7eb",
                          borderRadius: "10px",
                          backgroundColor: selectedNetwork === networkKey ? "#f0f9ff" : "white",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "left",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#3b82f6";
                          e.currentTarget.style.backgroundColor = "#f0f9ff";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedNetwork !== networkKey) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.backgroundColor = "white";
                          }
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <span style={{ fontSize: "32px" }}>{networkConfig.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#111", marginBottom: "2px" }}>
                            {networkConfig.displayName}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {networkConfig.name}
                          </div>
                        </div>
                        <span style={{ color: "#3b82f6", fontSize: "20px" }}>→</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Step 2: Switch Network */}
          {step === "switch-network" && selectedNetwork && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #f59e0b",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }}
              />
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                🔄 Switching to {NETWORKS[selectedNetwork].displayName}
              </h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                {isSwitching
                  ? "Please confirm the network switch in your wallet..."
                  : "Preparing to switch network..."}
              </p>

              {error && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#fee",
                    borderRadius: "8px",
                    border: "1px solid #fcc",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#c00" }}>{error}</div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Loading Fee */}
          {step === "loading-fee" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }}
              />
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Loading Fee Information...</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                Querying facilitator for optimal fee
              </p>
            </div>
          )}

          {/* Step 4: Confirm Payment */}
          {step === "confirm-payment" && feeInfo && selectedNetwork && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
                💳 Confirm Donation
              </h2>

              {/* Network Info */}
              <div
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{NETWORKS[selectedNetwork].icon}</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "16px" }}>
                      {NETWORKS[selectedNetwork].displayName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {NETWORKS[selectedNetwork].name}
                    </div>
                  </div>
                  {canChangeNetwork && (
                    <button
                      onClick={() => {
                        setSelectedNetwork(null);
                        setFeeInfo(null);
                        setError(null);
                        setIsManualNetworkSelection(true);
                        setStep("select-network");
                      }}
                      disabled={isPaying}
                      style={{
                        marginLeft: "auto",
                        padding: "6px 12px",
                        fontSize: "13px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: isPaying ? "not-allowed" : "pointer",
                        opacity: isPaying ? 0.5 : 1,
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>
                {address && (
                  <div style={{ fontSize: "13px", color: "#6b7280", fontFamily: "monospace" }}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
              </div>

              {/* Fee Breakdown */}
              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bfdbfe",
                }}
              >
                <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#1e40af" }}>
                  💰 Donation Breakdown
                </h3>

                <div
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}
                >
                  <span style={{ color: "#4b5563" }}>Donation Amount:</span>
                  <span style={{ fontWeight: "600", fontFamily: "monospace" }}>
                    ${displayAmount} USDC
                  </span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}
                >
                  <span style={{ color: "#4b5563" }}>Facilitator Fee:</span>
                  <span style={{ fontWeight: "600", fontFamily: "monospace", color: "#059669" }}>
                    ${displayFee} USDC
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #bfdbfe",
                    marginTop: "12px",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: "600", fontSize: "16px" }}>Total:</span>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      fontFamily: "monospace",
                      color: "#1e40af",
                    }}
                  >
                    ${displayTotal} USDC
                  </span>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fee",
                    borderRadius: "8px",
                    border: "1px solid #fcc",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#c00" }}>❌ {error}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleClose}
                  disabled={isPaying}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: isPaying ? "not-allowed" : "pointer",
                    opacity: isPaying ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  style={{
                    flex: 2,
                    padding: "14px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: isPaying ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    cursor: isPaying ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPaying) e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isPaying) e.currentTarget.style.backgroundColor = "#3b82f6";
                  }}
                >
                  {isPaying ? "⏳ Processing..." : `🎁 Donate $${displayTotal} USDC`}
                </button>
              </div>
            </>
          )}

          {/* Step 5: Processing */}
          {step === "processing" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #10b981",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }}
              />
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Processing Donation...</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {/* Step 6: Success */}
          {step === "success" && txHash && selectedNetwork && (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              {/* Success Icon */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#d1fae5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <span style={{ fontSize: "36px" }}>✅</span>
              </div>

              {/* Success Message */}
              <h2 style={{ margin: "0 0 10px 0", color: "#059669", fontSize: "24px" }}>
                Donation Successful!
              </h2>
              <p style={{ margin: "0 0 30px 0", color: "#6b7280", fontSize: "14px" }}>
                Thank you for your generosity! Your donation of ${displayAmount} USDC has been sent.
              </p>

              {/* Transaction Details */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "5px" }}>
                    Network
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{NETWORKS[selectedNetwork].icon}</span>
                    <span>{NETWORKS[selectedNetwork].displayName}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "5px" }}>
                    Transaction Hash
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: "#374151",
                      wordBreak: "break-all",
                      padding: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {txHash}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href={`${NETWORKS[selectedNetwork].blockExplorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "2px solid #3b82f6",
                    borderRadius: "8px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                  }}
                >
                  <span>🔍</span>
                  <span>View on Block Explorer</span>
                </a>

                <button
                  onClick={onClose}
                  style={{
                    padding: "12px 20px",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}

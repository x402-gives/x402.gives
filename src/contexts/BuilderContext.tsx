import { createContext, useContext, ReactNode } from "react";
import type { X402DonationConfig } from "../types/donation-config";
import type { Recipient } from "../hooks/useRecipient";

interface BuilderContextValue {
  // Current configuration
  config: X402DonationConfig | null;
  recipients: Recipient[];

  // Update functions
  updateConfig: (config: X402DonationConfig) => void;
  updateRecipients: (recipients: Recipient[]) => void;

  // QuickLink specific
  generateQuickLinkUrl: () => string;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

interface BuilderProviderProps {
  children: ReactNode;
  initialConfig?: X402DonationConfig | null;
  initialRecipients?: Recipient[];
  onConfigChange?: (config: X402DonationConfig) => void;
}

export function BuilderProvider({
  children,
  initialConfig = null,
  initialRecipients = [],
  onConfigChange,
}: BuilderProviderProps) {
  // For now, we'll implement a simple state-based approach
  // In a real implementation, this could update URL hash or use other persistence
  const contextValue: BuilderContextValue = {
    config: initialConfig,
    recipients: initialRecipients,
    updateConfig: (config: X402Config) => {
      onConfigChange?.(config);
    },
    updateRecipients: (_recipients: Recipient[]) => {
      // This could be implemented to update URL or other state
    },
    generateQuickLinkUrl: () => {
      // Implementation for generating QuickLink URL
      return "#";
    },
  };

  return <BuilderContext.Provider value={contextValue}>{children}</BuilderContext.Provider>;
}

export function useBuilderContext(): BuilderContextValue {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderProvider");
  }
  return context;
}

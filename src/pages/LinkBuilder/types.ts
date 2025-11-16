// Shared types for LinkBuilder components

export type NetworkType = "base-sepolia" | "base" | "xlayer-testnet" | "xlayer";

export interface BaseBuilderState {
  amount?: string;
  network: NetworkType;
}

// GitHub Verified Builder types
export interface GitHubBuilderState extends BaseBuilderState {
  username?: string;
  repo?: string;
  branch?: string;
  walletAddress?: string;
}

export interface GitHubBuilderStep {
  id: "repo-info" | "recipient-address" | "configuration" | "deploy";
  title: string;
  description: string;
  completed: boolean;
  valid: boolean;
}

// Quick Link Builder types
export interface QuickLinkBuilderState extends BaseBuilderState {
  sourceType: "wallet" | "ens";
  walletAddress?: string;
  ens?: string;
}

export interface QuickLinkBuilderStep {
  id: "source-info" | "configuration" | "generate";
  title: string;
  description: string;
  completed: boolean;
  valid: boolean;
}

// Step indicator types
export interface StepIndicatorProps {
  steps: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    valid: boolean;
  }>;
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
}

// Network selector types
export interface NetworkOption {
  value: NetworkType;
  label: string;
  description: string;
}

export interface NetworkSelectorProps {
  value: NetworkType;
  onValueChange: (value: NetworkType) => void;
  className?: string;
}

// Amount input types
export interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Builder result types
export interface BuilderResult {
  success: boolean;
  donationUrl: string;
  message?: string;
  configJson?: string; // Only for GitHub builder
}

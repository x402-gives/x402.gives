import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { NetworkSelectorProps, NetworkOption } from "../types";

const NETWORK_OPTIONS: NetworkOption[] = [
  {
    value: "base-sepolia",
    label: "Base Sepolia",
    description: "Testnet for development",
  },
  {
    value: "base",
    label: "Base",
    description: "Ethereum L2 network",
  },
  {
    value: "xlayer-testnet",
    label: "X Layer Testnet",
    description: "Testnet for OKX X Layer",
  },
  {
    value: "xlayer",
    label: "X Layer",
    description: "OKX X Layer mainnet",
  },
];

export function NetworkSelector({ value, onValueChange, className }: NetworkSelectorProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {NETWORK_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

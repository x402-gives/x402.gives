import { useState, useEffect } from "react";
import type { Recipient } from "../hooks/useRecipient";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AmountSelectorProps {
  defaultAmount?: string;
  recipients?: Recipient[];
  onAmountChange: (amount: string) => void;
}

const PRESET_AMOUNTS = ["0.1", "1", "5", "10", "25", "50"];

const findPresetMatch = (value: string): string | null => {
  if (!value || value === "." || value === "$") {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  const match = PRESET_AMOUNTS.find((preset) => Number(preset) === num);
  return match ?? null;
};

export function AmountSelector({ defaultAmount, onAmountChange }: AmountSelectorProps) {
  // Helper function to normalize amount (remove $ prefix)
  const normalizeAmount = (amount: string): string => {
    return amount.replace(/^\$\s*/, "");
  };

  const initialAmount = normalizeAmount(defaultAmount || "5");
  const [customAmount, setCustomAmount] = useState(initialAmount);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    findPresetMatch(initialAmount),
  );

  // Update amount when defaultAmount changes
  useEffect(() => {
    if (defaultAmount) {
      const normalized = normalizeAmount(defaultAmount);
      setCustomAmount(normalized);
      setSelectedPreset(findPresetMatch(normalized));
      onAmountChange(normalized);
    }
  }, [defaultAmount, onAmountChange]);

  const handlePresetClick = (amount: string) => {
    setCustomAmount(amount);
    setSelectedPreset(amount);
    onAmountChange(amount);
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and decimals
    const cleanValue = value.replace(/[^0-9.]/g, "");
    setCustomAmount(cleanValue);
    setSelectedPreset(findPresetMatch(cleanValue));

    // Only update parent if it's a valid number
    if (!Number.isNaN(Number.parseFloat(cleanValue)) && cleanValue !== "") {
      onAmountChange(cleanValue);
    }
  };

  const handleCustomAmountBlur = () => {
    // Format on blur
    const numValue = Number.parseFloat(customAmount);
    if (!Number.isNaN(numValue) && numValue > 0) {
      const formatted = numValue.toFixed(2);
      setCustomAmount(formatted);
      setSelectedPreset(findPresetMatch(formatted));
      onAmountChange(formatted);
    } else {
      setSelectedPreset(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Select Amount
          <span className="text-sm font-normal text-muted-foreground">USDC</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Amounts */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedPreset === amount ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(amount)}
              className="h-10"
            >
              ${amount}
            </Button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Custom Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="custom-amount"
              type="text"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              onBlur={handleCustomAmountBlur}
              className="pl-8"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

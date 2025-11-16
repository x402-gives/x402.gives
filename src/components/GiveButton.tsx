import { Heart } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";

interface GiveButtonProps {
  amount: string;
  onGive: () => void;
  disabled?: boolean;
  className?: string;
}

export function GiveButton({ amount, onGive, disabled = false, className }: GiveButtonProps) {
  const formattedAmount = formatCurrency(amount);

  return (
    <Button
      onClick={onGive}
      disabled={disabled}
      size="lg"
      className={cn("w-full font-semibold", className)}
    >
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4" />
        <span>Donate ${formattedAmount} USDC</span>
      </div>
    </Button>
  );
}

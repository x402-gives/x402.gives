import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { AmountInputProps } from "../types";

export function AmountInput({
  value,
  onChange,
  placeholder = "$5 or 5000000",
  className,
}: AmountInputProps) {
  return (
    <div className={className}>
      <Label htmlFor="amount">Default Amount (optional)</Label>
      <Input
        id="amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="text-xs text-muted-foreground mt-1">
        Use "$5" for USD or "5000000" for atomic units
      </div>
    </div>
  );
}

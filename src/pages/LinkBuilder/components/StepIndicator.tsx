import { Check, Circle } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { StepIndicatorProps } from "../types";

export function StepIndicator({ steps, currentStepId, onStepClick }: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStepId;
        const isCompleted = step.completed;
        const isClickable = onStepClick && step.valid;

        return (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step Number/Icon */}
            <div className="flex-shrink-0 mt-1">
              {isCompleted ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCurrent
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-background border-muted-foreground text-muted-foreground",
                    isClickable && "cursor-pointer hover:border-blue-300",
                  )}
                  onClick={() => isClickable && onStepClick(step.id)}
                >
                  {isCurrent ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "font-medium text-sm transition-colors",
                  isCurrent ? "text-blue-600 dark:text-blue-400" : "text-foreground",
                  isClickable && "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400",
                )}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { BuilderPanelGitHub } from "./BuilderPanelGitHub";
import { BuilderPanelQuickLink } from "./BuilderPanelQuickLink";

interface BuilderPanelProps {
  className?: string;
  onPreview?: (config: import("../types/donation-config").X402DonationConfig) => void;
}

/**
 * BuilderPanel - Side panel container for link builder
 * Displays appropriate form based on current route (GitHub or QuickLink)
 */
export function BuilderPanel({ className = "", onPreview }: BuilderPanelProps) {
  const params = useParams<{ username?: string; repo?: string; address?: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine mode based on route
  const isGitHubMode = !!params.username;
  const isQuickLinkMode = !!params.address;

  if (!isGitHubMode && !isQuickLinkMode) {
    return null; // Should not happen in builder mode
  }

  return (
    <div className={`relative ${className}`}>
      {/* Collapse/Expand Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="absolute -left-4 top-4 z-10 h-8 w-8 rounded-full border-2 bg-background shadow-md hover:bg-accent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Panel Content */}
      <div
        className={`
          h-full bg-background border-l border-border transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-96 opacity-100"}
        `}
      >
        <div className="h-full overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-foreground">Link Builder</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your donation link settings
              </p>
            </div>

            {/* Form Content */}
            {isGitHubMode ? (
              <BuilderPanelGitHub
                username={params.username!}
                repo={params.repo}
                onPreview={onPreview}
              />
            ) : (
              <BuilderPanelQuickLink address={params.address!} onPreview={onPreview} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

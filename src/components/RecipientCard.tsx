import { Check, Copy, ExternalLink, Shield, ShieldX, Github, User } from "lucide-react";
import { useState } from "react";
import type { RecipientPageData, DisplayData } from "../types/donation-config";
import { getDisplayData, detectLinkType, linkIcons } from "../types/donation-config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X402_CONFIG_PATH } from "../constants/config";

interface RecipientCardProps {
  data: RecipientPageData;
}

export function RecipientCard({ data }: RecipientCardProps) {
  // Get display data (merge config and metadata)
  const displayData = getDisplayData(data);
  const payTo = data.config.payTo; // Get payTo from config
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const getBlockExplorerUrl = (address: string) => {
    // Default to Base Sepolia for address viewing
    return `https://sepolia.basescan.org/address/${address}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatSourceReference = (source: DisplayData["source"]) => {
    const ref = source.reference;

    // For address-based sources (QuickLink), show shortened address
    if (source.type === "quicklink" || ref.startsWith("0x")) {
      return formatAddress(ref.split("#")[0]); // Remove hash if present
    }

    // For GitHub sources, show readable format
    if (source.type === "github") {
      // "github.com/username/repo/.x402/donation.json" -> "github.com/username/repo"
      const parts = ref.split("/");
      if (parts.length >= 3 && parts[0] === "github.com") {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }

    // For other types, show as-is but truncate if too long
    if (ref.length > 50) {
      return `${ref.slice(0, 24)}...${ref.slice(-24)}`;
    }

    return ref;
  };

  const renderLinks = (links?: DisplayData["links"]) => {
    return links?.map((link, index) => {
      const type = detectLinkType(link.url);
      const icon = (linkIcons as Record<string, string>)[type] || "🔗";
      const displayLabel = link.label || type;

      return (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          <span>{icon}</span>
          <span>{displayLabel}</span>
        </a>
      );
    });
  };

  // If there is no payTo, show special state
  if (!payTo) {
    // Show user information (if available)
    if (displayData.creator) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              {displayData.title}
              <Badge variant={displayData.source.verified ? "default" : "secondary"}>
                {displayData.source.verified ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <ShieldX className="h-3 w-3 mr-1" />
                )}
                {displayData.source.verified ? "Verified" : "Unverified"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={displayData.creator.avatar} alt={displayData.creator.handle} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-medium">@{displayData.creator.handle}</p>
                  {displayData.description && (
                    <p className="text-sm text-muted-foreground">{displayData.description}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Source: {displayData.source.reference}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Configuration not found. Please check if the repository has a valid `
                {X402_CONFIG_PATH}` file.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No recipients configured</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* HEADER */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {displayData.title}
          <Badge variant="secondary">{displayData.recipients.length + 1}</Badge>
          <Badge variant={displayData.source.verified ? "default" : "secondary"}>
            {displayData.source.verified ? (
              <Shield className="h-3 w-3 mr-1" />
            ) : (
              <ShieldX className="h-3 w-3 mr-1" />
            )}
            {displayData.source.verified ? "Verified" : "Unverified"}
          </Badge>
        </CardTitle>

        {displayData.description && (
          <p className="text-sm text-muted-foreground mt-2">{displayData.description}</p>
        )}

        {/* Creator Info */}
        {displayData.creator && (
          <div className="flex items-center gap-3 mt-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={displayData.creator.avatar} alt={displayData.creator.handle} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">@{displayData.creator.handle}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          Source: {formatSourceReference(displayData.source)}
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent>
        <div className="space-y-3">
          {(() => {
            // Calculate total bips from additional recipients
            const totalRecipientBips = displayData.recipients.reduce((sum, r) => sum + r.bips, 0);
            const payToBips = 10000 - totalRecipientBips;

            return (
              <>
                {/* Display payTo as primary recipient */}
                <div
                  key={payTo}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(payTo)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddress(payTo)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedAddress === payTo ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <a
                          href={getBlockExplorerUrl(payTo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(payToBips / 100).toFixed(1)}% of donation
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    Primary
                  </Badge>
                </div>

                {/* Display additional recipients */}
                {displayData.recipients.map((recipient) => (
                  <div
                    key={recipient.address}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {formatAddress(recipient.address)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(recipient.address)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedAddress === recipient.address ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <a
                            href={getBlockExplorerUrl(recipient.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(recipient.bips / 100).toFixed(1)}% of donation
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {displayData.recipients.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Distribution:</strong> Your donation will be automatically split according to
              the percentages shown above.
            </div>
          </div>
        )}
      </CardContent>

      {/* FOOTER - Links */}
      {displayData.links && displayData.links.length > 0 && (
        <div className="px-6 pb-6">
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">{renderLinks(displayData.links)}</div>
          </div>
        </div>
      )}
    </Card>
  );
}

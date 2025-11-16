import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Twitter, Facebook, MessageCircle, Share2, Copy, Check } from "lucide-react";
import * as QRCode from "qrcode";
import type { RecipientPageData } from "../types/donation-config";

interface ShareButtonsProps {
  recipient: string;
  amount?: string;
  pageData?: RecipientPageData;
  className?: string;
}

export function ShareButtons({ recipient, amount, pageData, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Generate share URL based on pageData
  const shareUrl = React.useMemo(() => {
    const origin = window.location.origin;

    // If from GitHub, use GitHub path
    if (
      pageData?.metadata.source.type === "github" &&
      pageData.metadata.source.verified &&
      pageData.metadata.githubUser
    ) {
      const parts = pageData.metadata.source.reference.split("/");
      // Extract username and repo from source like "github.com/jolestar/test-x402/.x402/donation.json"
      if (parts.length >= 3 && parts[0] === "github.com") {
        const username = parts[1];
        const repo = parts[2];
        return `${origin}/github.com/${username}/${repo}${amount ? `?amount=${encodeURIComponent(amount)}` : ""}`;
      }
    }

    // Fallback to ?to= parameter
    return `${origin}/give?to=${recipient}${amount ? `&amount=${amount}` : ""}`;
  }, [recipient, amount, pageData]);

  const shareText = `Support me via x402.gives 💝`;

  // Generate QR code
  React.useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 200, margin: 2 })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: any) => console.error("QR Code generation failed:", err));
  }, [shareUrl]);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Donation Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Share Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(shareLinks.twitter, "_blank")}
            className="flex items-center gap-2"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(shareLinks.facebook, "_blank")}
            className="flex items-center gap-2"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(shareLinks.telegram, "_blank")}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Telegram
          </Button>
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Scan QR Code</p>
            <div className="inline-block p-2 bg-white rounded-lg border">
              <img src={qrCodeUrl} alt="QR Code for donation link" className="w-32 h-32" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

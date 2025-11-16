import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface BuilderOutputTabsProps {
  url: string;
  displayName: string;
  isValid: boolean;
}

export function BuilderOutputTabs({ url, displayName, isValid }: BuilderOutputTabsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Badge image URL using GitHub Sponsors style
  const badgeImageUrl =
    "https://img.shields.io/badge/donate-x402.gives-blue?logo=githubsponsors&logoColor=white";

  // Generate badge markdown
  const generateBadgeMarkdown = (): string => {
    return `[![Support ${displayName}](${badgeImageUrl})](${url})`;
  };

  // Generate badge HTML
  const generateBadgeHtml = (): string => {
    return `<a href="${url}">\n  <img src="${badgeImageUrl}" alt="Support ${displayName}" />\n</a>`;
  };

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="badge">Badge</TabsTrigger>
      </TabsList>

      {/* URL Tab */}
      <TabsContent value="url" className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Donation URL</Label>
          <div className="p-3 bg-muted rounded-md mt-1">
            <code className="text-xs break-all">{url}</code>
          </div>
          <Button
            onClick={() => copyToClipboard(url, "url")}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={!isValid}
          >
            {copied === "url" ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied === "url" ? "Copied!" : "Copy URL"}
          </Button>
        </div>
      </TabsContent>

      {/* Badge Tab */}
      <TabsContent value="badge" className="space-y-3">
        <div className="space-y-3">
          {/* Badge Preview */}
          <div>
            <Label className="text-sm font-medium">Preview</Label>
            <div className="p-4 bg-muted rounded-md mt-1 flex items-center justify-center">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img src={badgeImageUrl} alt={`Support ${displayName}`} />
              </a>
            </div>
          </div>

          {/* Markdown Code */}
          <div>
            <Label className="text-sm font-medium">Markdown</Label>
            <div className="p-3 bg-muted rounded-md mt-1">
              <code className="text-xs break-all">{generateBadgeMarkdown()}</code>
            </div>
            <Button
              onClick={() => copyToClipboard(generateBadgeMarkdown(), "badge-markdown")}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!isValid}
            >
              {copied === "badge-markdown" ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied === "badge-markdown" ? "Copied!" : "Copy Markdown"}
            </Button>
          </div>

          {/* HTML Code */}
          <div>
            <Label className="text-sm font-medium">HTML</Label>
            <div className="p-3 bg-muted rounded-md mt-1">
              <pre className="text-xs whitespace-pre-wrap">{generateBadgeHtml()}</pre>
            </div>
            <Button
              onClick={() => copyToClipboard(generateBadgeHtml(), "badge-html")}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!isValid}
            >
              {copied === "badge-html" ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied === "badge-html" ? "Copied!" : "Copy HTML"}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

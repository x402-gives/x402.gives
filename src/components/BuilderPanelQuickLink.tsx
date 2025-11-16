import { useState, useEffect } from "react";
import { Plus, Trash2, Link } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { BuilderOutputTabs } from "./BuilderOutputTabs";
import type { X402DonationConfig } from "../types/donation-config";
import { encodeConfigToHash, decodeConfigFromHash } from "../lib/quicklinkConfig";
import { isAddress, type Address } from "viem";
import { NETWORKS, getAvailableNetworks } from "../config/networks";
import { normalizeNetworkConfig } from "../lib/networkUtils";

interface BuilderPanelQuickLinkProps {
  address: string;
  onPreview?: (config: X402DonationConfig) => void;
}

interface RecipientInput {
  address: string;
  bips: string; // Input as string for validation
}

export function BuilderPanelQuickLink({ address, onPreview }: BuilderPanelQuickLinkProps) {
  const [payTo, setPayTo] = useState(address);
  const [recipients, setRecipients] = useState<RecipientInput[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorAvatar, setCreatorAvatar] = useState("");
  const [links, setLinks] = useState<Array<{ url: string; label: string }>>([]);
  const [defaultAmount, setDefaultAmount] = useState("");
  const [networks, setNetworks] = useState<string[]>([]);

  // Load configuration from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    if (hash) {
      const config = decodeConfigFromHash(hash);
      if (config) {
        // Fill form fields with decoded config
        if (config.payTo) setPayTo(config.payTo);
        if (config.title) setTitle(config.title);
        if (config.description) setDescription(config.description);
        if (config.defaultAmount) setDefaultAmount(config.defaultAmount);
        if (config.network) {
          const normalized = normalizeNetworkConfig(config.network);
          setNetworks(normalized);
        }

        // Fill creator info
        if (config.creator) {
          if (config.creator.handle) setCreatorHandle(config.creator.handle);
          if (config.creator.avatar) setCreatorAvatar(config.creator.avatar);
        }

        // Fill links
        if (config.links && config.links.length > 0) {
          setLinks(
            config.links.map((link) => ({
              url: link.url,
              label: link.label || "",
            })),
          );
        }

        // Fill recipients
        if (config.recipients && config.recipients.length > 0) {
          setRecipients(
            config.recipients.map((r) => ({
              address: r.address,
              bips: String(r.bips),
            })),
          );
        }
      }
    }
  }, []); // Only run on mount

  // Update payTo when address prop changes
  useEffect(() => {
    setPayTo(address);
  }, [address]);

  // Calculate totals for validation
  const totalBips = recipients.reduce((sum, r) => sum + (parseInt(r.bips) || 0), 0);
  const remainingBips = 10000 - totalBips;
  const isValid = !!(
    payTo &&
    isAddress(payTo) &&
    totalBips <= 10000 &&
    recipients.every((r) => r.address && isAddress(r.address) && parseInt(r.bips) > 0)
  );

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", bips: "0" }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof RecipientInput, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const addLink = () => {
    setLinks([...links, { url: "", label: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof (typeof links)[0], value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const generateConfig = (): X402DonationConfig => {
    const config: X402DonationConfig = {
      payTo: payTo ? (payTo as Address) : undefined,
      defaultAmount: defaultAmount || undefined,
      network: networks.length > 0 ? (networks.length === 1 ? networks[0] : networks) : undefined,
    };

    // Add title (replaces name)
    if (title.trim()) config.title = title.trim();
    if (description.trim()) config.description = description.trim();

    // Add creator info
    if (creatorHandle.trim()) {
      config.creator = {
        handle: creatorHandle.trim(),
        avatar: creatorAvatar.trim() || undefined,
      };
    }

    // Add links
    if (links.length > 0) {
      config.links = links
        .filter((link) => link.url.trim())
        .map((link) => ({
          url: link.url.trim(),
          label: link.label.trim() || undefined,
        }));
    }

    // Add recipients if any
    if (recipients.length > 0 && totalBips > 0) {
      config.recipients = recipients.map((r) => ({
        address: r.address as Address,
        bips: parseInt(r.bips),
      }));
    }

    return config;
  };

  const generateUrl = (): string => {
    const config = generateConfig();
    const hash = encodeConfigToHash(config);
    return `${window.location.origin}/${payTo}#${hash}`;
  };

  const getDisplayName = (): string => {
    return title || `${payTo.slice(0, 6)}...${payTo.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Address Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link className="h-4 w-4" />
            Quick Link
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm">
            <div className="font-medium font-mono text-xs break-all">{address}</div>
            <div className="text-muted-foreground mt-1">
              Configuration will be encoded in URL hash
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          placeholder="Project or donation title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of what donations support..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Creator Info */}
      <div className="space-y-4">
        <Label>Creator Info (Optional)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="creatorHandle" className="text-sm">
              Handle
            </Label>
            <Input
              id="creatorHandle"
              placeholder="@username"
              value={creatorHandle}
              onChange={(e) => setCreatorHandle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="creatorAvatar" className="text-sm">
              Avatar URL
            </Label>
            <Input
              id="creatorAvatar"
              placeholder="https://..."
              value={creatorAvatar}
              onChange={(e) => setCreatorAvatar(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Links (Optional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </Button>
        </div>

        {links.map((link, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm">URL</Label>
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Label (Optional)</Label>
                  <Input
                    placeholder="Documentation, Website, etc."
                    value={link.label}
                    onChange={(e) => updateLink(index, "label", e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLink(index)}
                className="mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* PayTo Address */}
      <div className="space-y-2">
        <Label htmlFor="payTo">Primary Recipient Address *</Label>
        <Input
          id="payTo"
          placeholder="0x..."
          value={payTo}
          onChange={(e) => setPayTo(e.target.value)}
          className={payTo && !isAddress(payTo) ? "border-red-500" : ""}
        />
        {payTo && !isAddress(payTo) && (
          <p className="text-sm text-red-500">Invalid Ethereum address</p>
        )}
        {totalBips < 10000 && (
          <p className="text-sm text-muted-foreground">
            Will receive {(remainingBips / 100).toFixed(1)}% ({remainingBips} bips) of donations
          </p>
        )}
      </div>

      {/* Recipients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Additional Recipients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRecipient}
            disabled={recipients.length >= 9}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {recipients.map((recipient, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm">Address</Label>
                  <Input
                    placeholder="0x..."
                    value={recipient.address}
                    onChange={(e) => updateRecipient(index, "address", e.target.value)}
                    className={
                      recipient.address && !isAddress(recipient.address) ? "border-red-500" : ""
                    }
                  />
                  {recipient.address && !isAddress(recipient.address) && (
                    <p className="text-xs text-red-500 mt-1">Invalid address</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm">Bips (1 bip = 0.01%)</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    min="1"
                    max="10000"
                    value={recipient.bips}
                    onChange={(e) => updateRecipient(index, "bips", e.target.value)}
                    className={parseInt(recipient.bips) > 10000 ? "border-red-500" : ""}
                  />
                  {recipient.bips && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(parseInt(recipient.bips) / 100).toFixed(1)}% of donations
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRecipient(index)}
                className="mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {totalBips > 10000 && (
          <Alert className="border-red-500">
            <AlertDescription className="text-red-700">
              Total bips cannot exceed 10000 (100%). Current: {totalBips}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Default Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Default Amount (USD)</Label>
        <Input
          id="amount"
          placeholder="5.00"
          value={defaultAmount}
          onChange={(e) => setDefaultAmount(e.target.value)}
        />
      </div>

      {/* Network */}
      <div className="space-y-2">
        <Label htmlFor="network">Supported Networks (Optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Select networks where donations are accepted. Leave empty to allow all networks. For
          contract addresses, it's recommended to specify networks to prevent cross-network errors.
        </p>
        <div className="space-y-2 border border-input rounded-md p-3 bg-background">
          {getAvailableNetworks().map((networkKey) => {
            const networkConfig = NETWORKS[networkKey];
            const isChecked = networks.includes(networkKey);
            return (
              <label
                key={networkKey}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNetworks([...networks, networkKey]);
                    } else {
                      setNetworks(networks.filter((n) => n !== networkKey));
                    }
                  }}
                  className="rounded border-input"
                />
                <span className="text-sm">
                  {networkConfig.icon} {networkConfig.displayName}
                  {networkConfig.type === "testnet" && (
                    <span className="text-muted-foreground ml-1">(Testnet)</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Preview Button */}
      {onPreview && (
        <Button
          onClick={() => onPreview(generateConfig())}
          className="w-full mb-4"
          disabled={!isValid}
        >
          👁️ Preview Changes
        </Button>
      )}

      {/* Generated Content */}
      <BuilderOutputTabs url={generateUrl()} displayName={getDisplayName()} isValid={isValid} />
    </div>
  );
}

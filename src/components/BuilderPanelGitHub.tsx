import { useState, useEffect } from "react";
import { Github, Download, Copy, Check, Plus, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { BuilderOutputTabs } from "./BuilderOutputTabs";
import type { X402DonationConfig } from "../types/donation-config";
import { fetchGitHubConfig } from "../lib/githubConfig";
import { isAddress, type Address } from "viem";
import { X402_CONFIG_FILE, X402_CONFIG_PATH } from "../constants/config";
import { Network, NETWORKS } from "../config/networks";
import { normalizeNetworkConfig } from "../lib/networkUtils";

interface BuilderPanelGitHubProps {
  username: string;
  repo?: string;
  onPreview?: (config: X402DonationConfig) => void;
}

interface RecipientInput {
  address: string;
  bips: string; // Input as string for validation
}

export function BuilderPanelGitHub({ username, repo, onPreview }: BuilderPanelGitHubProps) {
  const [payTo, setPayTo] = useState("");
  const [recipients, setRecipients] = useState<RecipientInput[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorAvatar, setCreatorAvatar] = useState("");
  const [links, setLinks] = useState<Array<{ url: string; label: string }>>([]);
  const [defaultAmount, setDefaultAmount] = useState("");
  const [networks, setNetworks] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configExists, setConfigExists] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const targetRepo = repo ?? username; // user-level configs live in <username>/<username>
  const repoDisplayPath = `${username}/${targetRepo}`;
  const isProfileRepoMode = !repo;

  // Load existing configuration on mount
  useEffect(() => {
    async function loadExistingConfig() {
      setIsLoading(true);
      try {
        const repoInfoPromise = fetch(
          `https://api.github.com/repos/${username}/${targetRepo}`,
        ).catch(() => null);

        // Fetch both config and GitHub repo info in parallel
        const [configResult, repoResponse] = await Promise.all([
          fetchGitHubConfig(username, repo),
          repoInfoPromise,
        ]);

        // Load existing config if available
        if (configResult && configResult.config) {
          setConfigExists(true);
          // Populate form with existing config
          if (configResult.config.payTo) {
            setPayTo(configResult.config.payTo);
          }
          if (configResult.config.title) {
            setTitle(configResult.config.title);
          }
          if (configResult.config.description) {
            setDescription(configResult.config.description);
          }
          if (configResult.config.creator) {
            setCreatorHandle(configResult.config.creator.handle);
            if (configResult.config.creator.avatar) {
              setCreatorAvatar(configResult.config.creator.avatar);
            }
          }
          if (configResult.config.links) {
            setLinks(
              configResult.config.links.map((link) => ({
                url: link.url,
                label: link.label || "",
              })),
            );
          }
          if (configResult.config.recipients && configResult.config.recipients.length > 0) {
            setRecipients(
              configResult.config.recipients.map((r) => ({
                address: r.address,
                bips: r.bips.toString(),
              })),
            );
          }
          if (configResult.config.defaultAmount) {
            setDefaultAmount(configResult.config.defaultAmount);
          }
          if (configResult.config.network) {
            const normalized = normalizeNetworkConfig(configResult.config.network);
            setNetworks(normalized);
          }
        } else {
          setConfigExists(false);

          // No config found, auto-fill from GitHub repo info
          if (repoResponse && repoResponse.ok) {
            const repoData = await repoResponse.json();

            // Auto-fill title from repo name
            if (repoData.name && !title) {
              setTitle(repoData.name);
            }

            // Auto-fill description from repo description
            if (repoData.description && !description) {
              setDescription(repoData.description);
            }

            // Auto-fill creator from repo owner
            if (repoData.owner && !creatorHandle) {
              setCreatorHandle(repoData.owner.login);
              if (repoData.owner.avatar_url) {
                setCreatorAvatar(repoData.owner.avatar_url);
              }
            }

            // Auto-fill links from repo info
            const autoLinks: Array<{ url: string; label: string }> = [];
            if (repoData.html_url) {
              autoLinks.push({ url: repoData.html_url, label: "Repository" });
            }
            if (repoData.homepage) {
              autoLinks.push({ url: repoData.homepage, label: "Website" });
            }
            if (autoLinks.length > 0) {
              setLinks(autoLinks);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load existing config:", error);
        setConfigExists(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingConfig();
  }, [username, repo]);

  // Refresh configuration from GitHub (bypass cache)
  const refreshConfig = async () => {
    setIsRefreshing(true);
    try {
      // Fetch config with cache bypass
      const configResult = await fetchGitHubConfig(username, repo, true); // bypassCache = true

      if (configResult && configResult.config) {
        setConfigExists(true);
        // Update form with refreshed config
        if (configResult.config.payTo) {
          setPayTo(configResult.config.payTo);
        }
        if (configResult.config.title) {
          setTitle(configResult.config.title);
        }
        if (configResult.config.description) {
          setDescription(configResult.config.description);
        }
        if (configResult.config.creator) {
          setCreatorHandle(configResult.config.creator.handle);
          if (configResult.config.creator.avatar) {
            setCreatorAvatar(configResult.config.creator.avatar);
          }
        }
        if (configResult.config.links) {
          setLinks(
            configResult.config.links.map((link) => ({
              url: link.url,
              label: link.label || "",
            })),
          );
        }
        if (configResult.config.recipients && configResult.config.recipients.length > 0) {
          setRecipients(
            configResult.config.recipients.map((r) => ({
              address: r.address,
              bips: r.bips.toString(),
            })),
          );
        }
        if (configResult.config.defaultAmount) {
          setDefaultAmount(configResult.config.defaultAmount);
        }
        if (configResult.config.network) {
          const normalized = normalizeNetworkConfig(configResult.config.network);
          setNetworks(normalized);
        }
      } else {
        setConfigExists(false);
      }
    } catch (error) {
      console.error("Failed to refresh config:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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

    // Add title and description
    if (title.trim()) {
      config.title = title.trim();
    }
    if (description.trim()) {
      config.description = description.trim();
    }

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

  const downloadConfig = () => {
    const config = generateConfig();
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = X402_CONFIG_FILE;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyConfig = async () => {
    const config = generateConfig();
    const jsonString = JSON.stringify(config, null, 2);

    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied("config");
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy config:", err);
    }
  };

  const openGitHubEditor = () => {
    const config = generateConfig();
    const jsonString = JSON.stringify(config, null, 2);

    // Construct GitHub editor URL
    const repoPath = repoDisplayPath;
    const filePath = X402_CONFIG_PATH;
    const baseUrl = `https://github.com/${repoPath}`;

    if (configExists) {
      // For existing config, just open the edit page
      // GitHub doesn't support pre-filling content on edit, so we also copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          setCopied("config");
          setTimeout(() => setCopied(null), 3000);
        })
        .catch((err) => console.error("Failed to copy:", err));

      const githubUrl = `${baseUrl}/edit/main/${filePath}`;
      window.open(githubUrl, "_blank");
    } else {
      // For new config, encode content in URL
      const encodedContent = encodeURIComponent(jsonString);
      const githubUrl = `${baseUrl}/new/main?filename=${filePath}&value=${encodedContent}`;
      window.open(githubUrl, "_blank");
    }
  };

  const generateUrl = (): string => {
    const repoPath = repo ? `/${username}/${repo}` : `/${username}`;
    return `${window.location.origin}/github.com${repoPath}`;
  };

  const getDisplayName = (): string => {
    if (title) return title;
    if (repo) return `${username}/${repo}`;
    return username;
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading configuration...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Repository Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Github className="h-4 w-4" />
                  Repository
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshConfig}
                  disabled={isRefreshing}
                  className="h-8"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh config
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm">
                <div className="font-medium break-all">{repoDisplayPath}</div>
                <div className="text-muted-foreground mt-1">
                  Configuration file path: <code className="text-xs">{X402_CONFIG_PATH}</code>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Location: {repoDisplayPath}/{X402_CONFIG_PATH}
                </div>
              </div>
              <div className="space-y-3 mt-3">
                {isProfileRepoMode && (
                  <Alert variant="default">
                    <AlertDescription className="text-sm">
                      User-level links store configs in your profile repository{" "}
                      <a
                        href={`https://github.com/${repoDisplayPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {repoDisplayPath}
                      </a>
                      . Create it (or add a README) if it does not exist, then add{" "}
                      <code>{X402_CONFIG_PATH}</code>.
                    </AlertDescription>
                  </Alert>
                )}
                {configExists && (
                  <Alert variant="default">
                    <AlertDescription className="text-sm">
                      ✅ Existing configuration loaded
                    </AlertDescription>
                  </Alert>
                )}
                {!configExists && (
                  <Alert variant="default">
                    <AlertDescription className="text-sm">
                      📝 No configuration found. Create a new one below.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., My Open Source Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional. A friendly name for your donation page.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your project or what the donations will support"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Explain what you're raising funds for.
            </p>
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
            <p className="text-xs text-muted-foreground">
              Optional. Your handle and avatar will be displayed on the donation page.
            </p>
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
            <p className="text-xs text-muted-foreground">
              Optional. Add links to your website, documentation, social media, etc.
            </p>
          </div>

          <Separator />

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
              contract addresses, it's recommended to specify networks to prevent cross-network
              errors.
            </p>
            <div className="space-y-2 border border-input rounded-md p-3 bg-background">
              {(Object.keys(NETWORKS) as Network[]).map((networkKey) => {
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

          {/* Actions */}
          <div className="space-y-3">
            {/* Preview Button */}
            {onPreview && (
              <Button
                onClick={() => onPreview(generateConfig())}
                className="w-full"
                disabled={!isValid}
              >
                👁️ Preview Changes
              </Button>
            )}

            {/* GitHub Editor Button - Primary Action */}
            <Button
              onClick={openGitHubEditor}
              className="w-full"
              disabled={!isValid}
              variant="default"
            >
              <Github className="h-4 w-4 mr-2" />
              {configExists ? "Update Config on GitHub" : "Add Config on GitHub"}
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={downloadConfig}
                variant="outline"
                className="flex-1"
                disabled={!isValid}
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button onClick={copyConfig} variant="outline" className="flex-1" disabled={!isValid}>
                {copied === "config" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied === "config" ? "Copied!" : "Copy JSON"}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Quick Setup:</strong> Click the "{configExists ? "Update" : "Add"} Config on
              GitHub" button above to {configExists ? "edit" : "create"} the configuration file
              directly on GitHub.
              {configExists && (
                <>
                  <br />
                  💡 <em>The updated JSON will be copied to your clipboard for easy pasting.</em>
                </>
              )}
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Share Links */}
          <BuilderOutputTabs url={generateUrl()} displayName={getDisplayName()} isValid={isValid} />
        </>
      )}
    </div>
  );
}

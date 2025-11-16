import { useState, useEffect } from "react";
import { ArrowLeft, Github, Check, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { isAddress } from "viem";
import { StepIndicator } from "./components/StepIndicator";
import { NetworkSelector } from "./components/NetworkSelector";
import { AmountInput } from "./components/AmountInput";
import type { GitHubBuilderState, GitHubBuilderStep, NetworkType } from "./types";
import { X402_CONFIG_PATH } from "../../constants/config";

interface GitHubVerifiedBuilderProps {
  onBack: () => void;
}

const STEPS: GitHubBuilderStep[] = [
  {
    id: "repo-info",
    title: "Repository Information",
    description: "Enter your GitHub repository details",
    completed: false,
    valid: false,
  },
  {
    id: "recipient-address",
    title: "Recipient Address",
    description: "Configure the wallet address for donations",
    completed: false,
    valid: false,
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Set default amount and network",
    completed: false,
    valid: false,
  },
  {
    id: "deploy",
    title: "Generate & Deploy",
    description: "Create configuration and deploy to GitHub",
    completed: false,
    valid: false,
  },
];

export function GitHubVerifiedBuilder({ onBack }: GitHubVerifiedBuilderProps) {
  const [currentStepId, setCurrentStepId] = useState<string>("repo-info");
  const [state, setState] = useState<GitHubBuilderState>({
    network: "base-sepolia",
  });

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [detectedBranch, setDetectedBranch] = useState<string>("main");
  const [isDetectingBranch, setIsDetectingBranch] = useState(false);

  // Detect default branch when username and repo change
  useEffect(() => {
    const detectBranch = async () => {
      if (!state.username || !state.repo) {
        setDetectedBranch("main");
        return;
      }

      setIsDetectingBranch(true);
      try {
        const response = await fetch(
          `https://api.github.com/repos/${state.username}/${state.repo}`,
        );

        if (response.ok) {
          const data = await response.json();
          const branch = data.default_branch || "main";
          setDetectedBranch(branch);
          // Auto-set branch if not manually set
          if (!state.branch) {
            setState((prev) => ({ ...prev, branch }));
          }
        } else if (response.status === 404) {
          console.warn("Repository not found");
          setDetectedBranch("main");
        } else if (response.status === 403) {
          console.warn("GitHub API rate limit exceeded");
          setDetectedBranch("main");
        }
      } catch (error) {
        console.error("Failed to detect branch:", error);
        setDetectedBranch("main");
      } finally {
        setIsDetectingBranch(false);
      }
    };

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(detectBranch, 500);
    return () => clearTimeout(timeoutId);
  }, [state.username, state.repo]);

  function getStepCompleted(stepId: string): boolean {
    switch (stepId) {
      case "repo-info":
        return !!(state.username && state.repo && state.branch);
      case "recipient-address":
        return !!state.walletAddress;
      case "configuration":
        return true; // Configuration is always valid (optional fields)
      case "deploy":
        return false; // Only completed after successful deployment
      default:
        return false;
    }
  }

  function getStepValid(stepId: string): boolean {
    switch (stepId) {
      case "repo-info":
        return !!(state.username && state.repo);
      case "recipient-address":
        return !!state.walletAddress && isAddress(state.walletAddress);
      case "configuration":
        return true;
      case "deploy":
        return (
          getStepValid("repo-info") &&
          getStepValid("recipient-address") &&
          getStepValid("configuration")
        );
      default:
        return false;
    }
  }

  // Update steps validation
  const steps = STEPS.map((step) => ({
    ...step,
    completed: getStepCompleted(step.id),
    valid: getStepValid(step.id),
  }));

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateConfigJson = () => {
    if (!state.repo || !state.walletAddress) return "";

    return JSON.stringify(
      {
        name: state.repo,
        description: `Donation configuration for ${state.username}/${state.repo}`,
        payTo: state.walletAddress,
        defaultAmount: state.amount || "$5",
      },
      null,
      2,
    );
  };

  const generateGithubConfigUrl = () => {
    if (!state.username || !state.repo || !state.walletAddress) return "";

    const branch = state.branch || detectedBranch || "main";
    const configJson = generateConfigJson();
    const encodedJson = encodeURIComponent(configJson);
    return `https://github.com/${state.username}/${state.repo}/new/${branch}?filename=${X402_CONFIG_PATH}&value=${encodedJson}`;
  };

  const generateDonationUrl = () => {
    if (!state.username || !state.repo) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/github.com/${state.username}/${state.repo}${state.amount ? `?amount=${encodeURIComponent(state.amount)}` : ""}`;
  };

  const handleStepClick = (stepId: string) => {
    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    const currentIndex = STEPS.findIndex((s) => s.id === currentStepId);

    // Can only navigate to previous steps or next valid step
    if (stepIndex <= currentIndex || getStepValid(STEPS[currentIndex].id)) {
      setCurrentStepId(stepId);
    }
  };

  const handleNext = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStepId);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      setCurrentStepId(nextStep.id);
    }
  };

  const renderStepContent = () => {
    switch (currentStepId) {
      case "repo-info":
        return (
          <Card>
            <CardHeader>
              <CardTitle>GitHub Repository Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">GitHub Username</Label>
                <Input
                  id="username"
                  value={state.username || ""}
                  onChange={(e) => setState({ ...state, username: e.target.value })}
                  placeholder="jolestar"
                />
              </div>
              <div>
                <Label htmlFor="repo">Repository Name</Label>
                <Input
                  id="repo"
                  value={state.repo || ""}
                  onChange={(e) => setState({ ...state, repo: e.target.value })}
                  placeholder="x402-exec"
                />
              </div>
              <div>
                <Label htmlFor="branch">Default Branch</Label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={state.branch || detectedBranch}
                    onValueChange={(value: string) => setState({ ...state, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="master">master</SelectItem>
                    </SelectContent>
                  </Select>
                  {isDetectingBranch && (
                    <span className="text-xs text-muted-foreground">Detecting...</span>
                  )}
                  {!isDetectingBranch && detectedBranch && (
                    <Badge variant="secondary" className="text-xs">
                      Detected: {detectedBranch}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  The branch where {X402_CONFIG_PATH} will be added
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "recipient-address":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Recipient Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="github-wallet">Wallet Address</Label>
                <Input
                  id="github-wallet"
                  value={state.walletAddress || ""}
                  onChange={(e) => setState({ ...state, walletAddress: e.target.value })}
                  placeholder="0x..."
                />
                <div className="text-xs text-muted-foreground mt-1">
                  The wallet address that will receive donations
                </div>
              </div>
              {state.walletAddress && !isAddress(state.walletAddress) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Please enter a valid Ethereum wallet address</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case "configuration":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AmountInput
                value={state.amount || ""}
                onChange={(value) => setState({ ...state, amount: value })}
              />
              <div>
                <Label>Network</Label>
                <NetworkSelector
                  value={state.network}
                  onValueChange={(value: NetworkType) => setState({ ...state, network: value })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "deploy":
        const donationUrl = generateDonationUrl();
        const configJson = generateConfigJson();

        return (
          <div className="space-y-6">
            {/* Configuration Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm font-medium">Configuration ({X402_CONFIG_PATH}):</div>
                <Textarea value={configJson} readOnly className="text-xs font-mono h-24" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(configJson, "config")}
                  className="w-full"
                >
                  {copiedItem === "config" ? "Copied!" : "Copy Config"}
                </Button>
              </CardContent>
            </Card>

            {/* Deployment Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Deploy to GitHub</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Click the button below to add the donation configuration to your GitHub
                  repository. This will open GitHub's file creation page with the configuration
                  pre-filled.
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generateGithubConfigUrl(), "_blank")}
                    disabled={!state.username || !state.repo || !state.walletAddress}
                    className="justify-start w-full"
                  >
                    <Github className="h-3 w-3 mr-2" />
                    Add {X402_CONFIG_PATH} to {state.repo}
                  </Button>
                  <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
                    <strong>Note:</strong> If .x402 directory doesn't exist, GitHub will create it
                    automatically.
                  </div>
                </div>

                {/* Success Message */}
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Configuration deployed successfully! Your donation page is now available at:
                    <br />
                    <a
                      href={donationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {donationUrl}
                    </a>
                    <br />
                    <br />
                    <strong>Next:</strong> Visit your donation page to find Badge, Button, and
                    Widget embed codes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStepId);
  const canProceed = getStepValid(currentStepId) && currentStepIndex < STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mode Selection
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Steps */}
            <div className="lg:col-span-1">
              <StepIndicator
                steps={steps}
                currentStepId={currentStepId}
                onStepClick={handleStepClick}
              />
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {renderStepContent()}

                {/* Navigation */}
                {currentStepId !== "deploy" && (
                  <div className="flex justify-end">
                    <Button onClick={handleNext} disabled={!canProceed}>
                      Next Step
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

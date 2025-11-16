import { useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Wallet, Hash, AlertCircle, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { isAddress } from "viem";
import { StepIndicator } from "./components/StepIndicator";
import { NetworkSelector } from "./components/NetworkSelector";
import { AmountInput } from "./components/AmountInput";
import type { QuickLinkBuilderState, QuickLinkBuilderStep, NetworkType } from "./types";

interface QuickLinkBuilderProps {
  onBack: () => void;
}

const STEPS: QuickLinkBuilderStep[] = [
  {
    id: "source-info",
    title: "Source Information",
    description: "Choose wallet address or ENS name",
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
    id: "generate",
    title: "Generate Link",
    description: "Create your donation link",
    completed: false,
    valid: false,
  },
];

export function QuickLinkBuilder({ onBack }: QuickLinkBuilderProps) {
  const [currentStepId, setCurrentStepId] = useState<string>("source-info");
  const [state, setState] = useState<QuickLinkBuilderState>({
    sourceType: "wallet",
    network: "base-sepolia",
  });

  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const generateDonationUrl = () => {
    const baseUrl = window.location.origin;
    let params = "";

    if (state.sourceType === "wallet" && state.walletAddress) {
      params += `to=${state.walletAddress}`;
    } else if (state.sourceType === "ens" && state.ens) {
      params += `ens=${state.ens}`;
    }

    if (state.amount) {
      params += `${params ? "&" : ""}amount=${encodeURIComponent(state.amount)}`;
    }

    return params ? `${baseUrl}/give?${params}` : "";
  };

  function getStepCompleted(stepId: string): boolean {
    switch (stepId) {
      case "source-info":
        return !!(state.sourceType === "wallet" ? state.walletAddress : state.ens);
      case "configuration":
        return true; // Configuration is always valid (optional fields)
      case "generate":
        return !!generateDonationUrl();
      default:
        return false;
    }
  }

  function getStepValid(stepId: string): boolean {
    switch (stepId) {
      case "source-info":
        if (state.sourceType === "wallet") {
          return !!state.walletAddress && isAddress(state.walletAddress);
        } else {
          return !!state.ens && state.ens.endsWith(".eth");
        }
      case "configuration":
        return true;
      case "generate":
        return getStepValid("source-info") && getStepValid("configuration");
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
      case "source-info":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
              <div className="text-sm text-muted-foreground">
                Choose how recipients can send donations to you
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Source Type Selection */}
              <div className="grid gap-2">
                <Button
                  variant={state.sourceType === "wallet" ? "default" : "outline"}
                  onClick={() => setState({ ...state, sourceType: "wallet", ens: undefined })}
                  className="justify-start"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet Address
                </Button>
                <Button
                  variant={state.sourceType === "ens" ? "default" : "outline"}
                  onClick={() =>
                    setState({ ...state, sourceType: "ens", walletAddress: undefined })
                  }
                  className="justify-start"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  ENS Name
                </Button>
              </div>

              {/* Input Field */}
              {state.sourceType === "wallet" ? (
                <div>
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    value={state.walletAddress || ""}
                    onChange={(e) => setState({ ...state, walletAddress: e.target.value })}
                    placeholder="0x..."
                  />
                  {state.walletAddress && !isAddress(state.walletAddress) && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please enter a valid Ethereum wallet address
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="ens">ENS Name</Label>
                  <Input
                    id="ens"
                    value={state.ens || ""}
                    onChange={(e) => setState({ ...state, ens: e.target.value })}
                    placeholder="vitalik.eth"
                  />
                  {state.ens && !state.ens.endsWith(".eth") && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>ENS name must end with .eth</AlertDescription>
                    </Alert>
                  )}
                </div>
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

      case "generate":
        const donationUrl = generateDonationUrl();

        return (
          <div className="space-y-6">
            {/* Generated Link */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Donation Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={donationUrl} readOnly />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(donationUrl, "donation")}
                  >
                    {copiedItem === "donation" ? "Copied!" : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(donationUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Your donation link is ready! Visit the link above to access your donation page.
                    <br />
                    <br />
                    <strong>Next:</strong> On your donation page, you'll find Badge, Button, and
                    Widget embed codes to add donation options to your website.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(donationUrl, "_blank")}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Donation Page
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Visit your donation page to see all available embed codes (Badge, Button,
                    Widget)
                  </div>
                </div>
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
            <Badge variant="secondary">
              <Hash className="h-3 w-3 mr-1" />
              Quick Link Mode
            </Badge>
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
                {currentStepId !== "generate" && (
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

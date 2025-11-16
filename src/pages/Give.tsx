import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AmountSelector } from "../components/AmountSelector";
import { DonateDialog } from "../components/DonateDialog";
import { GiveButton } from "../components/GiveButton";
import { RecipientCard } from "../components/RecipientCard";
import { BuilderPanel } from "../components/BuilderPanel";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Settings,
  Link2,
  Github,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useRecipient } from "../hooks/useRecipient";
import { useBuilderMode } from "../hooks/useBuilderMode";
import { Welcome } from "./Welcome";
import { X402_CONFIG_PATH } from "../constants/config";

export function Give() {
  const navigate = useNavigate();
  const recipientPageData = useRecipient();
  const isBuilderMode = useBuilderMode();

  const [selectedAmount, setSelectedAmount] = useState("5");
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<
    import("../types/donation-config").X402DonationConfig | null
  >(null);

  // Update amount from URL parameter
  useEffect(() => {
    if (recipientPageData?.config.defaultAmount) {
      // Normalize amount: remove $ prefix
      const normalized = recipientPageData.config.defaultAmount.replace(/^\$\s*/, "");
      setSelectedAmount(normalized);
    }
  }, [recipientPageData?.config.defaultAmount]);

  const handleGive = () => {
    if (!effectivePageData || !effectivePageData.config.payTo) {
      return;
    }

    setShowDonateDialog(true);
  };

  const handleDonateSuccess = (result: {
    txHash: string;
    network: string;
    facilitatorFee?: string;
  }) => {
    console.log("Payment successful:", result);
    // You could add additional success handling here if needed
  };

  const handleDonateError = (error: string) => {
    console.error("Payment failed:", error);
    // You could add error handling here if needed
  };

  const handlePreview = (config: import("../types/donation-config").X402DonationConfig) => {
    // Both GitHub and QuickLink modes: Store config in local state for immediate preview
    // URL is NOT updated during preview - only when user explicitly copies the share URL
    console.log("Preview mode - config:", config);
    setPreviewConfig(config);
  };

  // Create effective page data: use preview config if available, otherwise use recipient page data
  const effectivePageData =
    previewConfig && isBuilderMode
      ? {
          config: {
            ...previewConfig,
            recipients: previewConfig.recipients || [],
          },
          metadata: recipientPageData?.metadata || {
            source: { type: "custom", reference: "preview", verified: false },
          },
        }
      : recipientPageData;

  // Data loading, show loading state (maintain same layout structure as actual content)
  if (!recipientPageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div
              className="max-w-4xl mx-auto flex items-center justify-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome page if no payTo (but not in builder mode)
  if (!isBuilderMode && !recipientPageData.config.payTo) {
    // Check if there is GitHub user information, if yes, show GitHub page
    if (recipientPageData.metadata.githubUser) {
      return <GitHubRepoPage pageData={recipientPageData} />;
    }
    // Otherwise show welcome page
    return <Welcome />;
  }

  // Donation page: return bare content, layout controlled by Router
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isBuilderMode ? "mr-96" : ""}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                x402.gives
                {isBuilderMode && (
                  <Badge variant="outline" className="ml-2 text-sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Builder Mode
                  </Badge>
                )}
                {previewConfig && isBuilderMode && (
                  <Badge variant="secondary" className="ml-2 text-sm">
                    👁️ Preview
                  </Badge>
                )}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {isBuilderMode
                  ? "Configure and preview your donation page"
                  : "Support creators with crypto donations"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - Recipients */}
              <div className="space-y-6">
                {effectivePageData?.config.payTo ? (
                  <RecipientCard data={effectivePageData} />
                ) : isBuilderMode ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground py-8">
                        <p className="text-lg font-medium mb-2">No configuration yet</p>
                        <p className="text-sm">
                          Use the builder panel on the right to create your donation configuration
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              {/* Right Column - Amount Selection and Give Button */}
              <div className="space-y-6">
                {effectivePageData?.config.payTo ? (
                  <>
                    <AmountSelector
                      defaultAmount={effectivePageData.config.defaultAmount}
                      recipients={effectivePageData.config.recipients || []}
                      onAmountChange={setSelectedAmount}
                    />

                    <GiveButton amount={selectedAmount} onGive={handleGive} />
                  </>
                ) : null}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 space-y-4">
              <div className="flex flex-col items-center gap-2">
                {!isBuilderMode && (
                  <Button
                    onClick={() => navigate("/builder")}
                    variant="ghost"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Link2 className="h-4 w-4" />
                    Create Donation Link
                  </Button>
                )}
              </div>
              <p className="leading-relaxed">
                Zero platform fees. Funds go directly to creators.
                <br />
                Built with ❤️ on{" "}
                <a
                  href="https://x402.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  x402
                </a>{" "}
                and{" "}
                <a
                  href="https://x402x.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  x402x
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Builder Panel - fixed sidebar on the right, only show in builder mode */}
      {isBuilderMode && (
        <BuilderPanel className="fixed top-0 right-0 h-screen z-50" onPreview={handlePreview} />
      )}

      {/* Donate Dialog */}
      {effectivePageData?.config.payTo && (
        <DonateDialog
          isOpen={showDonateDialog}
          onClose={() => setShowDonateDialog(false)}
          amount={selectedAmount}
          recipients={effectivePageData.config.recipients || []}
          payTo={effectivePageData.config.payTo}
          onSuccess={handleDonateSuccess}
          onError={handleDonateError}
        />
      )}
    </div>
  );
}

// GitHub repository page - displayed when repository has no configuration file (no nav and footer, focused on guiding configuration)
function GitHubRepoPage({ pageData }: { pageData: NonNullable<ReturnType<typeof useRecipient>> }) {
  const navigate = useNavigate();
  const { githubUser, githubRepo } = pageData.metadata;

  if (!githubUser) return <Welcome />;

  const repoUrl = githubRepo
    ? `https://github.com/${githubRepo.full_name}`
    : `https://github.com/${githubUser.login}`;
  const configUrl = githubRepo
    ? `https://github.com/${githubRepo.full_name}/${X402_CONFIG_PATH}`
    : `https://github.com/${githubUser.login}/${githubUser.login}/${X402_CONFIG_PATH}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Github className="h-8 w-8 text-gray-700" />
              <Badge variant="secondary" className="text-lg px-3 py-1">
                GitHub Repository
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {githubRepo ? githubRepo.name : githubUser.login}
            </h1>
            {githubRepo && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {githubRepo.description || "No description"}
              </p>
            )}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              {githubRepo && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {githubRepo.stargazers_count} stars
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {githubRepo.forks_count} forks
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(repoUrl, "_blank")}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Repository
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Status */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Donation Link Not Configured
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  This repository has not configured an x402 donation link. To start receiving
                  donations, you need to:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Create a{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {X402_CONFIG_PATH}
                    </code>{" "}
                    configuration file in the repository
                  </li>
                  <li>Configure your wallet address and donation settings</li>
                  <li>Commit and push the configuration file</li>
                </ol>
                <div className="pt-4">
                  <Button
                    onClick={() =>
                      navigate(
                        `/builder/github.com/${githubUser.login}${githubRepo ? `/${githubRepo.name}` : ""}`,
                      )
                    }
                    className="w-full flex items-center gap-2"
                    size="lg"
                  >
                    <Link2 className="h-4 w-4" />
                    Create Donation Link Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="h-5 w-5" />
                    Quick Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Create Configuration File</p>
                        <p className="text-xs text-gray-500">
                          Create <code>.x402</code> folder in repository root directory
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Add Configuration</p>
                        <p className="text-xs text-gray-500">
                          Add your wallet address and donation preferences
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Start Receiving Donations</p>
                        <p className="text-xs text-gray-500">
                          Your donation link will automatically become active
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Configuration File Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-xs text-gray-800 dark:text-gray-200">
                      {JSON.stringify(
                        {
                          version: "1.0",
                          payTo: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                          defaultAmount: "5",
                        },
                        null,
                        2,
                      )}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save as: <code>{configUrl}</code>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => window.open("https://x402.org", "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View x402 Docs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

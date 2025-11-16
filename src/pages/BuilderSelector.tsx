import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Link2, ArrowRight, CheckCircle, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { isAddress } from "viem";

export default function BuilderSelector() {
  const navigate = useNavigate();

  // Form states
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidGitHub, setIsValidGitHub] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);

  // Update validation states
  const updateGitHubValidation = () => {
    setIsValidGitHub(githubOwner.trim().length > 0);
  };

  const updateAddressValidation = () => {
    setIsValidAddress(walletAddress.trim().length > 0 && isAddress(walletAddress.trim()));
  };

  // Handle form submissions
  const handleGitHubSubmit = () => {
    if (isValidGitHub) {
      const repoPath = githubRepo.trim() ? `/${githubRepo.trim()}` : "";
      navigate(`/builder/github.com/${githubOwner.trim()}${repoPath}`);
    }
  };

  const handleQuickLinkSubmit = () => {
    if (isValidAddress) {
      navigate(`/builder/${walletAddress.trim()}`);
    }
  };

  // Handle input changes with validation
  const handleGithubOwnerChange = (value: string) => {
    setGithubOwner(value);
    setTimeout(updateGitHubValidation, 0);
  };

  const handleGithubRepoChange = (value: string) => {
    setGithubRepo(value);
    setTimeout(updateGitHubValidation, 0);
  };

  const handleWalletAddressChange = (value: string) => {
    setWalletAddress(value);
    setTimeout(updateAddressValidation, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Link Generator
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create Your Donation Link
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Generate professional donation pages, links, and embed code for your project
            </p>
          </div>

          {/* Mode Selection with Forms */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* GitHub Verified Mode */}
            <Card className="shadow-xl border-2 hover:border-green-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Github className="h-7 w-7 text-gray-700 dark:text-gray-300" />
                  <CardTitle className="text-xl">GitHub Verified Mode</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Recommended
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  Create verifiable donation links for open source projects using .x402
                  configuration file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Verified via GitHub configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Automatic configuration deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Perfect for open source projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Get trust badge</span>
                  </div>
                </div>

                <Separator />

                {/* Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="github-owner" className="text-sm font-medium">
                        Username *
                      </Label>
                      <Input
                        id="github-owner"
                        placeholder="jolestar"
                        value={githubOwner}
                        onChange={(e) => handleGithubOwnerChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github-repo" className="text-sm font-medium">
                        Repository (Optional)
                      </Label>
                      <Input
                        id="github-repo"
                        placeholder="x402-exec"
                        value={githubRepo}
                        onChange={(e) => handleGithubRepoChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGitHubSubmit}
                    disabled={!isValidGitHub}
                    className="w-full"
                    size="lg"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Start GitHub Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Link Mode */}
            <Card className="shadow-xl border-2 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-7 w-7 text-blue-600" />
                  <CardTitle className="text-xl">Quick Link</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Instant
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  Quickly generate donation links using wallet address or ENS domain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>No configuration file required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Instant link generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Perfect for personal websites and blogs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span>URL-encoded configuration</span>
                  </div>
                </div>

                <Separator />

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-address" className="text-sm font-medium">
                      Wallet Address or ENS *
                    </Label>
                    <Input
                      id="wallet-address"
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                      value={walletAddress}
                      onChange={(e) => handleWalletAddressChange(e.target.value)}
                      className={`mt-1 ${walletAddress && !isValidAddress ? "border-red-500" : ""}`}
                    />
                    {walletAddress && !isValidAddress && (
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid Ethereum address or ENS domain
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleQuickLinkSubmit}
                    disabled={!isValidAddress}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Create Quick Link
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-0">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Choose the Mode That Suits You
                </h3>
                <div className="grid gap-4 md:grid-cols-2 text-left max-w-4xl mx-auto">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700 dark:text-green-300">
                      GitHub Verified Mode is suitable for:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Open source projects and code repositories</li>
                      <li>• Projects requiring community verification</li>
                      <li>• Projects wanting trust badges</li>
                      <li>• Projects with GitHub organizations</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">
                      Quick Link is suitable for:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Individual creators and artists</li>
                      <li>• Blogs and personal websites</li>
                      <li>• Projects needing quick launch</li>
                      <li>• Projects not using GitHub</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

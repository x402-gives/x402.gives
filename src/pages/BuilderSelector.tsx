import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, ArrowRight, CheckCircle, Shield, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export default function BuilderSelector() {
  const navigate = useNavigate();

  // Form states
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [isValidGitHub, setIsValidGitHub] = useState(false);

  // Update validation states
  const updateGitHubValidation = () => {
    setIsValidGitHub(githubOwner.trim().length > 0);
  };

  // Handle form submissions
  const handleGitHubSubmit = () => {
    if (isValidGitHub) {
      const repoPath = githubRepo.trim() ? `/${githubRepo.trim()}` : "";
      navigate(`/builder/github.com/${githubOwner.trim()}${repoPath}`);
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
          <div className="max-w-lg mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}

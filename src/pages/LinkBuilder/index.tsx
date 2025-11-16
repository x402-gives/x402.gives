import { useState } from "react";
import { Github, Link2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { GitHubVerifiedBuilder } from "./GitHubVerifiedBuilder";
import { QuickLinkBuilder } from "./QuickLinkBuilder";

type BuilderMode = "github" | "quicklink";

export function LinkBuilder() {
  const [selectedMode, setSelectedMode] = useState<BuilderMode | null>(null);

  const handleBack = () => {
    setSelectedMode(null);
  };

  if (selectedMode === "github") {
    return <GitHubVerifiedBuilder onBack={handleBack} />;
  }

  if (selectedMode === "quicklink") {
    return <QuickLinkBuilder onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Link Builder</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Create donation links and embed codes for x402.gives
            </p>
            <Badge variant="secondary" className="mt-2">
              <Link2 className="h-3 w-3 mr-1" />
              Generate Verified & Quick Links
            </Badge>
          </div>

          {/* Mode Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* GitHub Verified Mode */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300"
              onClick={() => setSelectedMode("github")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  GitHub Verified
                </CardTitle>
                <CardDescription>
                  Create verified donation links for GitHub repositories using .x402 configuration
                  files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Verified through GitHub configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Automatic configuration deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Perfect for open source projects</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg">
                  <Github className="h-4 w-4 mr-2" />
                  Start GitHub Setup
                </Button>
              </CardContent>
            </Card>

            {/* Quick Link Mode */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300"
              onClick={() => setSelectedMode("quicklink")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  Quick Link
                </CardTitle>
                <CardDescription>
                  Generate direct donation links with wallet addresses or ENS names
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>No configuration files needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Instant link generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Great for personal websites or blogs</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg" variant="secondary">
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Quick Link
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-2">How it works</h3>
              <p className="text-muted-foreground">
                Choose GitHub Verified for projects that need verified donation links through GitHub
                configuration files, or Quick Link for instant donation links without any setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

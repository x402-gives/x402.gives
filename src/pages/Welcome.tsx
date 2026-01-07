import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  Shield,
  Zap,
  Github,
  ArrowRight,
  CheckCircle,
  FileText,
  Settings,
  ExternalLink,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import AppFooter from "../components/app-footer";

const DEMO_OWNER = "x402-gives";
const DEMO_REPO = "x402.gives";
const DEMO_PAGE_URL = `https://x402.gives/github.com/${DEMO_OWNER}/${DEMO_REPO}`;
const DEMO_CONFIG_URL = `https://github.com/${DEMO_OWNER}/${DEMO_REPO}/blob/main/.x402/donation.json`;
const BADGE_IMAGE_URL =
  "https://img.shields.io/badge/donate-x402.gives-blue?logo=githubsponsors&logoColor=white";

export function Welcome() {
  const navigate = useNavigate();
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");

  const handleGitHubSubmit = () => {
    if (githubOwner.trim()) {
      const repoPath = githubRepo.trim() ? `/${githubRepo.trim()}` : "";
      navigate(`/builder/github.com/${githubOwner.trim()}${repoPath}`);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Zero Platform Fees",
      description: "100% of donations go directly to creators.",
    },
    {
      icon: Zap,
      title: "Instant Transfer",
      description: "Donations are sent directly on-chain, no intermediaries, no delays.",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Generate donation links and share them anywhere, it's that simple.",
    },
    {
      icon: Heart,
      title: "Support Creators",
      description: "Help your favorite open source developers, artists, and creators.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Value Proposition */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="/logos/x402.gives-logo.svg"
                    alt="x402.gives logo"
                    className="h-12 w-auto drop-shadow-sm"
                  />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Trustless Donations for Open Source
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  A verified donation platform based on the x402 protocol, providing transparent
                  and trustless donation solutions for open source projects
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400 italic">
                  "Everyone can give, nothing is held."
                </p>
              </div>

              {/* For Creators vs For Donors */}
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            🎯 For Creators
                          </h3>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Create professional donation pages and links for your project in just a
                            few steps
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            💝 For Donors
                          </h3>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Support your favorite open source projects, funds go directly to
                            creators' wallets
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right Side - Quick Start CTA */}
            <div className="flex items-center">
              <Card className="shadow-xl border-2 w-full">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    Create Donation Link Now
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Set up verified donations for your GitHub project
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Why GitHub Verification */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Verified through your repository</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Get a trust badge for your README</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Configuration synced via .x402/donation.json</span>
                    </div>
                  </div>

                  {/* GitHub Verified */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <Label className="text-base font-medium">GitHub Project</Label>
                      <Badge variant="outline" className="text-xs">
                        Recommended
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="github-owner" className="text-sm">
                          Username
                        </Label>
                        <Input
                          id="github-owner"
                          placeholder="your-username"
                          value={githubOwner}
                          onChange={(e) => setGithubOwner(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github-repo" className="text-sm">
                          Repository (Optional)
                        </Label>
                        <Input
                          id="github-repo"
                          placeholder="awesome-project"
                          value={githubRepo}
                          onChange={(e) => setGithubRepo(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleGitHubSubmit}
                      disabled={!githubOwner.trim()}
                      className="w-full"
                      size="lg"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>


                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started in Minutes</CardTitle>
              <p className="text-muted-foreground">
                From creation to receiving donations, it only takes a few minutes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Github className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Enter GitHub Info</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your GitHub username and repository
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Configure Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set up recipient addresses and options in the Builder
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Copy Link</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Copy the generated donation link
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">4. Start Receiving</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share on README or social media
                  </p>
                </div>
              </div>

              <div
                id="demo"
                className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">🎯</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Live Example</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See how x402.gives works with our own repository
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <a href={DEMO_PAGE_URL} target="_blank" rel="noreferrer" className="inline-block">
                    <img
                      src={BADGE_IMAGE_URL}
                      alt="Support x402.gives"
                      className="h-7 w-auto hover:opacity-80 transition-opacity"
                    />
                  </a>
                  <div className="flex-1 min-w-fit" />
                  <Button asChild size="default" className="gap-2">
                    <a href={DEMO_PAGE_URL} target="_blank" rel="noreferrer">
                      <PlayCircle className="h-4 w-4" />
                      Open Live Demo
                    </a>
                  </Button>
                  <Button asChild size="default" variant="outline" className="gap-2">
                    <a href={DEMO_CONFIG_URL} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4" />
                      View Config File
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-none shadow-xl bg-white/85 dark:bg-gray-900/70 backdrop-blur">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Badge variant="secondary" className="px-4 py-1 text-sm">
                    <Sparkles className="h-3 w-3 mr-1 inline" />
                    Learn More
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Deep dive into x402.gives
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Read the docs, explore the codebase, and learn about the protocols that power
                    this experience.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => navigate("/docs")}
                  >
                    <FileText className="h-4 w-4" />
                    View Full Documentation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open("https://github.com/x402-gives/x402.gives", "_blank")
                    }
                  >
                    <Github className="h-4 w-4" />
                    GitHub Project
                  </Button>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <div className="grid gap-6 md:grid-cols-2 text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          x402
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          x402 Protocol
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Transfer-with-authorization standard built for trust-minimized payments.
                      </p>
                      <Button
                        variant="link"
                        className="px-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        onClick={() => window.open("https://x402.org", "_blank")}
                      >
                        Learn more <ExternalLink className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          x402x
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          x402x Settlement
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Facilitator, hooks, and settlement router that power programmable donations.
                      </p>
                      <Button
                        variant="link"
                        className="px-0 h-auto text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        onClick={() => window.open("https://x402x.dev", "_blank")}
                      >
                        Learn more <ExternalLink className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Github,
  Link2,
  FileCode,
  Users,
  DollarSign,
  Globe,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AppFooter from "../components/app-footer";
import { X402_CONFIG_DIR, X402_CONFIG_FILE, X402_CONFIG_PATH } from "../constants/config";

export function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              x402.gives Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Complete usage guide and configuration instructions
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">🚀 Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  For Creators: Create Donation Links
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Enter your GitHub username/repository or wallet address on the homepage</li>
                  <li>The system redirects to the Builder page for configuration</li>
                  <li>Fill in recipient addresses, amounts, and other information</li>
                  <li>Click preview to see the effect</li>
                  <li>Copy the generated share link</li>
                  <li>Share on your README, social media, or website</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  For Donors: Support Creators
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Visit the donation link shared by the creator</li>
                  <li>Select or enter the donation amount</li>
                  <li>Connect your wallet (supports multiple wallets)</li>
                  <li>Confirm the transaction and complete the donation</li>
                  <li>Funds go directly to the creator's wallet, no intermediaries</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Two Ways to Create */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                🛠️ Two Ways to Create Donation Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* GitHub Config File */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Github className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold text-xl">
                    Method 1: GitHub Configuration File (Recommended)
                  </h3>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verifiable
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  User-level links (route <code>/github.com/&lt;username&gt;</code>) read the config
                  from your GitHub profile repository <code>{`<username>/<username>`}</code>. Create
                  that repository (GitHub already uses it for your profile README) and add{" "}
                  <code>{X402_CONFIG_PATH}</code> at the root.
                </p>

                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Advantages</p>
                        <ul className="text-sm text-green-800 dark:text-green-200 mt-1 space-y-1">
                          <li>• Configuration stored in your repository, fully controllable</li>
                          <li>• Display "Verified" badge to increase trust</li>
                          <li>• Automatically associate GitHub user and repository information</li>
                          <li>• Support version management, can be modified at any time</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Step-by-Step Instructions</h4>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                      <li>
                        <span className="font-medium">
                          Create configuration file in repository root directory
                        </span>
                        <code className="block mt-1 ml-5 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                          {X402_CONFIG_PATH}
                        </code>
                      </li>
                      <li>
                        <span className="font-medium">
                          Add configuration content (see complete example below)
                        </span>
                      </li>
                      <li>
                        <span className="font-medium">Commit and push to GitHub</span>
                      </li>
                      <li>
                        <span className="font-medium">Visit your donation page</span>
                        <code className="block mt-1 ml-5 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                          https://x402.gives/github.com/username/repository
                        </code>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Builder Tool */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-xl">Method 2: Using Builder Tool</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Use Cases</p>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                          <li>• No GitHub repository required</li>
                          <li>• Quickly generate temporary donation links</li>
                          <li>• Visual configuration interface, easy to use</li>
                          <li>• Real-time preview</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Usage Steps</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Visit the homepage and enter wallet address or GitHub information</li>
                      <li>Fill in the configuration form in the Builder interface</li>
                      <li>Click "Preview Changes" to see the effect</li>
                      <li>Click "Copy URL" to copy the share link</li>
                      <li>
                        The generated link contains complete configuration information (via URL
                        hash)
                      </li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> Links generated by Builder encode configuration
                          information in the URL. If you need to modify the configuration, you need
                          to regenerate the link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Config Detail */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileCode className="h-6 w-6" />
                GitHub Configuration File Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Configuration File Structure</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Configuration file uses JSON format and supports the following fields:
                </p>

                <div className="space-y-4">
                  {/* recipients */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        recipients
                      </code>
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      List of recipients, must contain at least one recipient. Each recipient
                      contains:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 ml-8 mt-1 space-y-1">
                      <li>
                        • <code>address</code>: Wallet address (required)
                      </li>
                      <li>
                        • <code>bips</code>: Distribution ratio, range 0-10000 (10000 = 100%)
                      </li>
                    </ul>
                  </div>

                  {/* Optional fields */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        title
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Donation page title. Uses repository name when not set.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        description
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Donation page description. Uses repository description when not set.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        defaultAmount
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Default donation amount (in USD).
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        creator
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Creator information, including <code>handle</code> (username) and{" "}
                      <code>avatar</code> (avatar URL).
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        links
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                      Array of related links, each link contains <code>url</code> and optional{" "}
                      <code>label</code>.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Complete Example */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Complete Configuration Example</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`{
  "payTo": "0x1234567890123456789012345678901234567890",
  "network": "base-mainnet",
  "recipients": [
    {
      "address": "0x1234567890123456789012345678901234567890",
      "bips": 7000
    },
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "bips": 3000
    }
  ],
  "title": "Support Example Project",
  "description": "Help us build amazing open source software",
  "defaultAmount": "10",
  "creator": {
    "handle": "example-user",
    "avatar": "https://avatars.githubusercontent.com/u/12345678"
  },
  "links": [
    {
      "url": "https://example.com",
      "label": "Website"
    },
    {
      "url": "https://twitter.com/example"
    }
  ]
}`}</code>
                  </pre>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Save as:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    {X402_CONFIG_PATH}
                  </code>
                </p>
              </div>

              {/* Multi-recipient Example */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Multi-Recipient Distribution Example</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Use the bips field to achieve precise revenue distribution (10000 = 100%):
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <ul className="text-sm space-y-2">
                    <li>
                      • 70% to main developer: <code>bips: 7000</code>
                    </li>
                    <li>
                      • 30% to platform/contributors: <code>bips: 3000</code>
                    </li>
                    <li>• Sum must equal 10000 (100%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Integration Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GitHub Badge */}
              <div>
                <h3 className="font-semibold text-lg mb-3">GitHub README Badge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add a donation badge to your README.md:
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Markdown format:</p>
                    <div className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
                      <code className="text-sm text-gray-100">
                        [![Support via
                        x402.gives](https://img.shields.io/badge/donate-x402.gives-blue?logo=ethereum)](https://x402.gives/github.com/your-username/repository)
                      </code>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">HTML format:</p>
                    <div className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
                      <code className="text-sm text-gray-100">
                        {`<a href="https://x402.gives/github.com/your-username/repository">
  <img src="https://img.shields.io/badge/donate-x402.gives-blue?logo=ethereum" alt="Support via x402.gives" />
</a>`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Website Embed */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Website Embedding (In Development)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  iframe embedding will be supported in the future, stay tuned.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                ❓ Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How to modify existing configuration?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>GitHub configuration file method:</strong> Directly modify the{" "}
                  <code>{X402_CONFIG_PATH}</code> file in the repository and commit. Changes take
                  effect immediately.
                  <br />
                  <strong>Builder method:</strong> Need to regenerate the link. Configuration
                  information is stored in the URL and cannot be directly modified.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What fees are charged?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  x402.gives does not charge platform fees. You only pay the blockchain network gas
                  fees, and 100% of donation funds go to the creator's wallet.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Which networks are supported?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Currently supports the following networks:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 ml-4 space-y-1">
                  <li>• Base Mainnet</li>
                  <li>• Base Sepolia (Testnet)</li>
                  <li>• X Layer Mainnet</li>
                  <li>• X Layer Testnet</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How to set up multiple recipients?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add multiple recipients in the <code>recipients</code> array, use the{" "}
                  <code>bips</code> field to set the distribution ratio. The sum of bips for all
                  recipients must equal 10000 (representing 100%).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Where should the configuration file be placed?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a <code>{X402_CONFIG_DIR}</code> folder in the repository root directory,
                  then create a <code>{X402_CONFIG_FILE}</code> file inside it. Full path:{" "}
                  <code>{X402_CONFIG_PATH}</code>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Why is GitHub configuration file recommended?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advantages of GitHub configuration file method:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 ml-4 mt-1 space-y-1">
                  <li>• Configuration stored in your repository, fully controllable</li>
                  <li>• Display "Verified" badge to increase trust</li>
                  <li>• Can be modified at any time without regenerating links</li>
                  <li>• Support version management and history</li>
                  <li>
                    • Automatically associate project information for more professional display
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home CTA */}
          <div className="text-center pb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-blue-100 mb-6 text-lg">Create your donation link now</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => navigate("/")}
                  >
                    Start Creating
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    onClick={() =>
                      window.open("https://github.com/x402-gives/x402.gives", "_blank")
                    }
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View GitHub
                  </Button>
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

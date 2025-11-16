import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { Address } from "viem";
import { isAddress } from "viem";
import {
  convertGitHubUserInfo,
  fetchGitHubConfig,
  fetchGitHubRepoInfo,
  fetchGitHubUserInfo,
} from "../lib/githubConfig";
import { createQuickLinkConfig, validateConfig } from "../lib/quicklinkConfig";
import type { RecipientPageData, GitHubRepo } from "../types/donation-config";
import {
  buildGitHubDataWithFile,
  buildGitHubDataWithoutFile,
  buildQuickLinkData,
} from "../types/donation-config";

export interface Recipient {
  address: Address;
  bips: number; // 0-10000 (basis points)
}

// RecipientConfig interface has been replaced by RecipientPageData

export function useRecipient(): RecipientPageData | null {
  const location = useLocation();
  const params = useParams<{ username?: string; repo?: string; address?: string }>();
  const [config, setConfig] = useState<RecipientPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function resolveConfig() {
      setIsLoading(true);

      try {
        const pathname = location.pathname;
        const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;

        // Check if it's a GitHub route
        if (pathname.startsWith("/github.com/") && params.username) {
          // GitHub verifiable route
          const result = await fetchGitHubConfig(params.username, params.repo);

          if (result) {
            // Successfully fetched GitHub config - scenario with config file
            const x402Config = result.config;
            const userInfo = result.userInfo;

            // Get repository information (if repo parameter exists)
            let githubRepo: GitHubRepo | undefined;
            if (params.repo) {
              githubRepo = await fetchGitHubRepoInfo(params.username, params.repo);
            }

            const githubUser = convertGitHubUserInfo(userInfo);
            const pageData = buildGitHubDataWithFile(x402Config, githubUser, githubRepo);
            setConfig(pageData);
          } else {
            // GitHub config fetch failed - scenario without config file
            const userInfo = await fetchGitHubUserInfo(params.username);

            if (userInfo) {
              // Get repository information (if repo parameter exists)
              let githubRepo: GitHubRepo | undefined;
              if (params.repo) {
                githubRepo = await fetchGitHubRepoInfo(params.username, params.repo);
              }

              const githubUser = convertGitHubUserInfo(userInfo);
              const pageData = buildGitHubDataWithoutFile(githubUser, githubRepo);
              setConfig(pageData);
            } else {
              // Even user info fetch failed
              setConfig(null);
            }
          }
        } else if (params.address && isAddress(params.address)) {
          // QuickLink scenario: direct transfer to an address, supports hash config
          const quickLinkConfig = createQuickLinkConfig(params.address, hash);

          if (quickLinkConfig && validateConfig(quickLinkConfig)) {
            // Has valid config, use settings from config
            const reference = `${params.address}${hash ? `#${hash}` : ""}`;
            const pageData = buildQuickLinkData(quickLinkConfig, reference);
            setConfig(pageData);
          } else {
            // Invalid config or no config, create default config (direct transfer to address)
            const x402Config = {
              payTo: params.address as Address,
            };
            const reference = params.address;
            const pageData = buildQuickLinkData(x402Config, reference);
            setConfig(pageData);
          }
        } else {
          // Invalid address or unsupported route, return null
          setConfig(null);
        }
      } catch (error) {
        console.error("Error resolving recipient config:", error);
        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    }

    resolveConfig();
  }, [
    location.search,
    location.pathname,
    location.hash,
    params.username,
    params.repo,
    params.address,
  ]);

  // Return null indicates still loading
  if (isLoading) {
    return null;
  }

  return config;
}

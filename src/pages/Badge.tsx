import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGitHubConfig } from "../lib/githubConfig";

export function Badge() {
  const { "*": target } = useParams<{ "*": string }>();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function generateBadge() {
      if (!target) {
        setError(true);
        return;
      }

      try {
        // Parse target (github.com/user or github.com/user/repo)
        const parts = target.split("/");
        if (parts[0] !== "github.com" || parts.length < 2) {
          setError(true);
          return;
        }

        const username = parts[1];
        const repo = parts.length > 2 ? parts[2] : undefined;

        // Fetch GitHub configuration
        const result = await fetchGitHubConfig(username, repo);
        if (!result) {
          setError(true);
          return;
        }

        // Generate SVG badge
        const badgeSvg = generateBadgeSvg(result.config.title || username, repo);
        setSvg(badgeSvg);
      } catch (err) {
        console.error("Badge generation failed:", err);
        setError(true);
      }
    }

    generateBadge();
  }, [target]);

  if (error) {
    // Return an error badge
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="30">
        <rect width="200" height="30" fill="#f87171" />
        <text x="10" y="20" fill="white" fontSize="12">
          Error loading badge
        </text>
      </svg>
    );
  }

  if (!svg) {
    // Return a loading badge
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="30">
        <rect width="200" height="30" fill="#e5e7eb" />
        <text x="10" y="20" fill="#6b7280" fontSize="12">
          Loading...
        </text>
      </svg>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

function generateBadgeSvg(name: string, repo?: string): string {
  const displayName = repo ? `${name}/${repo}` : name;
  const text = `Support ${displayName} via x402.gives`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="200" height="30" fill="url(#grad)" rx="4"/>
    <text x="10" y="20" fill="white" fontSize="12" fontFamily="Arial, sans-serif">${text}</text>
  </svg>`;
}

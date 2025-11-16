import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * BuilderRedirect component
 *
 * Redirects builder URLs to the corresponding donation page with ?builder=true parameter
 *
 * Examples:
 * - /builder/github.com/jolestar/repo → /github.com/jolestar/repo?builder=true
 * - /builder/0x123... → /0x123...?builder=true
 */
export default function BuilderRedirect() {
  const params = useParams<{ username?: string; repo?: string; address?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle GitHub builder URLs
    if (params.username) {
      const repo = params.repo || "";
      const targetPath = repo
        ? `/github.com/${params.username}/${repo}`
        : `/github.com/${params.username}`;
      navigate(`${targetPath}?builder=true`, { replace: true });
      return;
    }

    // Handle address builder URLs
    if (params.address) {
      navigate(`/${params.address}?builder=true`, { replace: true });
      return;
    }

    // Fallback to builder selector
    navigate("/builder", { replace: true });
  }, [params, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Builder...</p>
      </div>
    </div>
  );
}

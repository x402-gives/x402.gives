import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to detect if the current page is in builder mode
 * Builder mode is activated when URL contains ?builder=true
 */
export function useBuilderMode(): boolean {
  const location = useLocation();

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("builder") === "true";
  }, [location.search]);
}

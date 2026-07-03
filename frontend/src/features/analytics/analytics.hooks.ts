import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./analytics.api";

/** Dashboard stats with light polling for a near-realtime feel. Keeps the last
 * data while refetching so the charts don't flash on each tick. */
export const useDashboard = (days: number) =>
  useQuery({
    queryKey: ["analytics-dashboard", days],
    queryFn: () => analyticsApi.dashboard(days),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });

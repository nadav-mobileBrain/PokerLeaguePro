import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface StatPlayer {
  display_name: string;
  avatar_url: string | null;
  profit: number;
}

export interface LeagueStats {
  league_leader: StatPlayer | null;
  top_single_game_profit: StatPlayer | null;
}

export const useLeagueStats = (leagueId?: string) => {
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `[useLeagueStats] Fetching stats via RPC for league ${leagueId}`
      );
      const { data, error: rpcError } = await supabase.rpc("get_league_stats", {
        p_league_id: leagueId,
      });

      console.log("[useLeagueStats] RPC response:", { data, rpcError });

      if (rpcError) throw rpcError;

      setStats(data);
    } catch (err: any) {
      console.error("[useLeagueStats] Error fetching stats:", err);
      setError(new Error(err.message || "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

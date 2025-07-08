import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface UserProfileStats {
  total_games: number;
  total_profit: number;
  average_profit_per_game: number;
  win_rate: number; // Percentage of games with positive profit
  total_buy_ins: number;
  best_single_game: number;
  worst_single_game: number;
}

export const useUserProfileStats = (userId?: string) => {
  const [stats, setStats] = useState<UserProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Temporarily disable stats functionality until migration is applied
    console.log(`[useUserProfileStats] Stats disabled until migration applied`);
    setStats({
      total_games: 0,
      total_profit: 0,
      average_profit_per_game: 0,
      win_rate: 0,
      total_buy_ins: 0,
      best_single_game: 0,
      worst_single_game: 0,
    });
    setIsLoading(false);
    return;

    // Commented out until migration is applied
    /*
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useUserProfileStats] Fetching stats for user ${userId}`);

      // Call a Supabase RPC function to get user profile stats
      const { data, error: rpcError } = await supabase.rpc(
        "get_user_profile_stats",
        {
          p_user_id: userId,
        }
      );

      if (rpcError) {
        // If the function doesn't exist yet, return default stats
        if (rpcError.code === "PGRST202") {
          console.log(
            "[useUserProfileStats] Function not found, using default stats"
          );
          setStats({
            total_games: 0,
            total_profit: 0,
            average_profit_per_game: 0,
            win_rate: 0,
            total_buy_ins: 0,
            best_single_game: 0,
            worst_single_game: 0,
          });
          setIsLoading(false);
          return;
        }
        throw rpcError;
      }

      console.log("[useUserProfileStats] RPC response:", data);

      // If no data, return default stats
      if (!data) {
        setStats({
          total_games: 0,
          total_profit: 0,
          average_profit_per_game: 0,
          win_rate: 0,
          total_buy_ins: 0,
          best_single_game: 0,
          worst_single_game: 0,
        });
      } else {
        setStats(data);
      }
    } catch (err: any) {
      console.error("[useUserProfileStats] Error fetching stats:", err);
      setError(new Error(err.message || "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
    */
  }, [userId]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return { stats, isLoading, error, refetch: fetchUserStats };
};

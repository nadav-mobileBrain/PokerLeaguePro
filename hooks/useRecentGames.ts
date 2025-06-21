import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";

// Define the structure for a recent game, based on the expected RPC response
export interface RecentGame {
  game_id: string;
  game_name: string;
  game_status: string;
  game_created_at: string; // timestamptz
  league_id: string;
  league_name: string;
}

export const useRecentGames = () => {
  const { supabaseProfile } = useUserStore();
  const [games, setGames] = useState<RecentGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecentGames = useCallback(async () => {
    if (!supabaseProfile?.id) {
      console.log(
        "[useRecentGames] Waiting for Supabase profile to be available."
      );
      // Don't set loading to false here, wait for profile
      return;
    }

    const userId = supabaseProfile.id;
    console.log(
      `[useRecentGames] Fetching recent games for User ID: ${userId}`
    );
    setIsLoading(true);
    setError(null);

    try {
      // This RPC function needs to be created in your Supabase project.
      // See backend-setup.md for the SQL function definition.
      const rpcParams = { p_user_id: userId };
      console.log(
        "[useRecentGames] Calling RPC 'get_recent_games' with params:",
        rpcParams
      );
      const { data, error: rpcError } = await supabase.rpc(
        "get_recent_games",
        rpcParams
      );

      if (rpcError) {
        throw rpcError;
      }

      setGames(data || []);
      console.log(
        "[useRecentGames] Recent games fetched:",
        data?.length || 0,
        "rows. Data:",
        data
      );
    } catch (err: any) {
      console.error("[useRecentGames] Error fetching recent games:", err);
      setError(new Error(err.message || "An unexpected error occurred."));
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseProfile?.id]);

  useEffect(() => {
    // Fetch games when the component mounts and when the user profile is available
    console.log(
      "[useRecentGames] useEffect triggered. Supabase profile ID:",
      supabaseProfile?.id
    );
    if (supabaseProfile?.id) {
      fetchRecentGames();
    }
  }, [supabaseProfile?.id, fetchRecentGames]);

  return { games, isLoading, error, refetch: fetchRecentGames };
};

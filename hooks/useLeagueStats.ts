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

    console.log(`[useLeagueStats] Fetching stats for league ${leagueId}`);
    setIsLoading(true);
    setError(null);

    try {
      const { data: gamePlayers, error: gamePlayersError } = await supabase
        .from("game_players")
        .select(
          `
          profit,
          total_cash_in,
          cash_out_amount,
          player_id,
          players!inner (
            id,
            display_name,
            avatar_url
          ),
          games!inner (
            id,
            league_id,
            status,
            completed_at
          )
        `
        )
        .eq("games.league_id", leagueId)
        .not("games.completed_at", "is", null);

      console.log("[useLeagueStats] Game players fetched:", {
        count: gamePlayers?.length,
        gamePlayersError,
      });
      console.log(
        "[useLeagueStats] Raw gamePlayers data:",
        JSON.stringify(gamePlayers, null, 2)
      );

      if (gamePlayersError) throw gamePlayersError;

      if (!gamePlayers || gamePlayers.length === 0) {
        console.log("[useLeagueStats] No completed game players found.");
        setStats({ league_leader: null, top_single_game_profit: null });
        return;
      }

      // Calculate League Leader (sum of profits per player)
      const playerProfits = new Map<
        string,
        { totalProfit: number; displayName: string; avatarUrl: string | null }
      >();

      for (const gp of gamePlayers) {
        const player = gp.players as unknown as {
          id: string;
          display_name: string;
          avatar_url: string | null;
        };

        const calculatedProfit = gp.cash_out_amount - gp.total_cash_in;

        if (player) {
          const current = playerProfits.get(gp.player_id) || {
            totalProfit: 0,
            displayName: player.display_name,
            avatarUrl: player.avatar_url,
          };
          current.totalProfit += calculatedProfit;
          playerProfits.set(gp.player_id, current);
        }
      }

      let leagueLeader: StatPlayer | null = null;
      if (playerProfits.size > 0) {
        const sortedByTotalProfit = [...playerProfits.entries()].sort(
          (a, b) => b[1].totalProfit - a[1].totalProfit
        );
        const topPlayerOverall = sortedByTotalProfit[0];
        leagueLeader = {
          display_name: topPlayerOverall[1].displayName,
          avatar_url: topPlayerOverall[1].avatarUrl,
          profit: topPlayerOverall[1].totalProfit,
        };
      }
      console.log("[useLeagueStats] Calculated league leader:", leagueLeader);

      // Calculate Top Single Game Profit
      let topSingleGameProfit: StatPlayer | null = null;
      const sortedBySingleGame = [...gamePlayers].sort((a, b) => {
        const profitA = a.cash_out_amount - a.total_cash_in;
        const profitB = b.cash_out_amount - b.total_cash_in;
        return profitB - profitA;
      });

      const topGame = sortedBySingleGame[0];
      if (topGame) {
        const topProfit = topGame.cash_out_amount - topGame.total_cash_in;

        if (topProfit > 0) {
          const player = topGame.players as unknown as {
            display_name: string;
            avatar_url: string | null;
          };
          if (player) {
            topSingleGameProfit = {
              display_name: player.display_name,
              avatar_url: player.avatar_url,
              profit: topProfit,
            };
          }
        }
      }
      console.log(
        "[useLeagueStats] Calculated top single game profit:",
        topSingleGameProfit
      );

      setStats({
        league_leader: leagueLeader,
        top_single_game_profit: topSingleGameProfit,
      });
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

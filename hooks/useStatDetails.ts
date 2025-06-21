import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type StatDetailPlayer = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  value: number; // Generic value, could be total profit or top single game profit
};

export const useStatDetails = (statType?: string, leagueId?: string) => {
  const [data, setData] = useState<StatDetailPlayer[] | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatDetails = useCallback(async () => {
    if (!statType || !leagueId) {
      console.log("[useStatDetails] Missing statType or leagueId", {
        statType,
        leagueId,
      });
      return;
    }

    console.log("[useStatDetails] Fetching details for:", {
      statType,
      leagueId,
    });
    setIsLoading(true);
    setError(null);

    try {
      let rpcName = "";
      let valueKey = "";
      let screenTitle = "";

      if (statType === "league-leaders") {
        rpcName = "get_league_profit_ranking";
        valueKey = "total_profit";
        screenTitle = "League Standings";
      } else if (statType === "top-single-game-profits") {
        rpcName = "get_top_single_game_profits_by_league";
        valueKey = "top_profit";
        screenTitle = "Top Single Game Profits";
      } else {
        throw new Error(`Invalid stat type: ${statType}`);
      }

      console.log(
        `[useStatDetails] Calling RPC: ${rpcName} with leagueId:`,
        leagueId
      );

      // First, let's check if the RPC function exists
      const { data: funcExists, error: funcError } = await supabase
        .rpc("fn_exists", {
          function_name: rpcName,
        })
        .single();

      console.log(`[useStatDetails] RPC function exists check:`, {
        funcExists,
        funcError,
      });

      const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, {
        p_league_id: leagueId,
      });

      console.log("[useStatDetails] RPC response:", {
        rpcData,
        rpcError,
        dataLength: rpcData ? rpcData.length : 0,
        firstItem: rpcData && rpcData.length > 0 ? rpcData[0] : null,
      });

      if (rpcError) throw rpcError;

      if (!rpcData) {
        console.warn("[useStatDetails] RPC returned no data.");
        setData([]);
        setIsLoading(false);
        return;
      }

      const formattedData = rpcData.map((player: any) => ({
        user_id: player.user_id,
        display_name: player.display_name,
        avatar_url: player.avatar_url,
        value: player[valueKey],
      }));

      console.log("[useStatDetails] Formatted data:", {
        length: formattedData.length,
        firstItem: formattedData.length > 0 ? formattedData[0] : null,
      });

      setTitle(screenTitle);
      setData(formattedData);
    } catch (err: any) {
      console.error(`[useStatDetails] Error fetching for ${statType}:`, err);
      setError(new Error(err.message || "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  }, [statType, leagueId]);

  useEffect(() => {
    fetchStatDetails();
  }, [fetchStatDetails]);

  return { data, title, isLoading, error, refetch: fetchStatDetails };
};

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { League, LeagueMember } from "@/types/database";

export function useLeagueDetails(leagueId: string | undefined | string[]) {
  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Normalize leagueId (handle potential array from router)
  const currentLeagueId = Array.isArray(leagueId) ? leagueId[0] : leagueId;

  useEffect(() => {
    if (!currentLeagueId) {
      // Don't fetch if ID is missing or invalid
      setIsLoading(false);
      setLeague(null);
      setMembers([]);
      setError(new Error("League ID is missing."));
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      setLeague(null); // Clear previous data
      setMembers([]);

      console.log(
        `[useLeagueDetails] Fetching details (incl. invite code) for League ID: ${currentLeagueId}`
      );

      try {
        // Fetch League Details - including invite_code
        const { data: leagueData, error: leagueError } = await supabase
          .from("leagues")
          .select("*")
          .eq("id", currentLeagueId)
          .single();

        if (leagueError) throw leagueError;
        if (!leagueData) throw new Error("League not found.");
        setLeague(leagueData as League);
        console.log("[useLeagueDetails] Fetched league data:", leagueData);

        // Fetch League Members (joining with users table)
        const { data: membersData, error: membersError } = await supabase
          .from("league_members")
          .select(
            `
            *,
            users (*)
          `
          )
          .eq("league_id", currentLeagueId)
          // Explicitly cast the return type
          .returns<LeagueMember[]>();

        if (membersError) throw membersError;
        console.log("[useLeagueDetails] Fetched members data:", membersData);
        setMembers(membersData || []);
      } catch (err: any) {
        console.error("[useLeagueDetails] Fetch failed:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [currentLeagueId]); // Rerun when leagueId changes

  return { league, members, isLoading, error };
}

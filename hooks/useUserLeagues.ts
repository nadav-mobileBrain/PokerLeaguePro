import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient"; // Use the simple client
import { League } from "@/types/database";
import { useUserStore } from "@/store/userStore";

export function useUserLeagues() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { ensureUserProfile } = useUserStore();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchLeagues = useCallback(async () => {
    // Ensure Clerk user is loaded before proceeding
    if (!isClerkLoaded) {
      // Still waiting for Clerk
      setIsLoading(true);
      return;
    }

    if (!clerkUser) {
      // Clerk is loaded, but user is not signed in
      setIsLoading(false);
      setLeagues([]); // No leagues if not signed in
      setError(null);
      return;
    }

    // Clerk user is loaded and signed in, proceed to fetch Supabase data
    setIsLoading(true);
    setError(null);

    try {
      // 1. Ensure the user profile exists (create if needed)
      console.log(
        "[useUserLeagues] Ensuring user profile exists for Clerk ID:",
        clerkUser!.id
      );
      const userProfile = await ensureUserProfile(clerkUser!.id);
      const supabaseUserId = userProfile.id;
      console.log("[useUserLeagues] Found Supabase User ID:", supabaseUserId);

      // 2. Call the RPC function to get leagues for this user
      console.log(
        "[useUserLeagues] Calling RPC get_all_user_leagues for user:",
        supabaseUserId
      );
      const { data: userLeaguesData, error: rpcError } = await supabase.rpc(
        "get_all_user_leagues",
        { p_user_id: supabaseUserId }
      );

      if (rpcError) {
        console.error(
          "[useUserLeagues] Error calling get_all_user_leagues RPC:",
          rpcError
        );
        throw rpcError;
      }

      console.log(
        "[useUserLeagues] Fetched leagues via RPC:",
        userLeaguesData?.length ?? 0
      );

      // Set the leagues state with the data returned from the RPC
      setLeagues((userLeaguesData || []) as League[]);
    } catch (err) {
      console.error("[useUserLeagues] Fetch failed:", err);
      setError(err);
      setLeagues([]); // Clear leagues on error
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser, isClerkLoaded]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]); // Rerun when Clerk user or loading state changes

  return { leagues, isLoading, error, refetch: fetchLeagues };
}

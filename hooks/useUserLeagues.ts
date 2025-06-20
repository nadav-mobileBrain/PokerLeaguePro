import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient"; // Use the simple client
import { League } from "@/types/database";

export function useUserLeagues() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
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
    const fetchLeagues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Find the Supabase user ID corresponding to the Clerk ID
        console.log(
          "[useUserLeagues] Fetching Supabase user ID for Clerk ID:",
          clerkUser!.id
        );
        const { data: supabaseUserData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUser!.id) // Use non-null assertion as we check clerkUser above
          .single();

        if (userError) {
          if (userError.code === "PGRST116") {
            // PGRST116: "The result contains 0 rows"
            console.warn(
              "[useUserLeagues] Supabase user not found for Clerk ID:",
              clerkUser.id
            );
            // This might happen if the webhook hasn't processed yet. Treat as no leagues found.
            setLeagues([]);
            setIsLoading(false);
            return; // Exit early
          } else {
            console.error(
              "[useUserLeagues] Error fetching Supabase user:",
              userError
            );
            throw userError; // Throw other errors
          }
        }

        if (!supabaseUserData?.id) {
          console.warn(
            "[useUserLeagues] Supabase user ID not found after fetch for Clerk ID:",
            clerkUser.id
          );
          setLeagues([]);
          setIsLoading(false);
          return;
        }
        const supabaseUserId = supabaseUserData.id;
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
    };

    fetchLeagues();
  }, [clerkUser, isClerkLoaded]); // Rerun when Clerk user or loading state changes

  return { leagues, isLoading, error };
}

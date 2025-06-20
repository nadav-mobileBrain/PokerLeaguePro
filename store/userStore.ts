import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "@/types/database"; // Assuming you have this type defined

interface UserState {
  supabaseProfile: UserProfile | null;
  isLoadingProfile: boolean;
  errorProfile: string | null;
  fetchSupabaseProfile: (clerkId: string) => Promise<void>;
  clearSupabaseProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  supabaseProfile: null,
  isLoadingProfile: false,
  errorProfile: null,

  fetchSupabaseProfile: async (clerkId) => {
    if (!clerkId) {
      console.warn("[UserStore] Attempted to fetch profile with no Clerk ID.");
      set({
        supabaseProfile: null,
        isLoadingProfile: false,
        errorProfile: "No Clerk ID provided.",
      });
      return;
    }
    set({ isLoadingProfile: true, errorProfile: null });
    console.log(
      `[UserStore] Fetching Supabase profile for Clerk ID: ${clerkId}`
    );
    try {
      const { data, error } = await supabase
        .from("users") // Your public users table
        .select("*") // Select all profile fields
        .eq("clerk_id", clerkId)
        .single();

      if (error) {
        // Handle case where user exists in Clerk but not Supabase DB yet?
        // This might happen if your DB sync webhook fails.
        if (error.code === "PGRST116") {
          // "query returned no rows"
          console.warn(
            `[UserStore] No Supabase profile found for Clerk ID: ${clerkId}. User might need creation/sync.`
          );
          set({
            supabaseProfile: null,
            isLoadingProfile: false,
            errorProfile: "Supabase profile not found.",
          });
        } else {
          throw error; // Throw other errors
        }
      } else {
        console.log("[UserStore] Fetched Supabase profile:", data);
        set({
          supabaseProfile: data as UserProfile,
          isLoadingProfile: false,
          errorProfile: null,
        });
      }
    } catch (err: any) {
      console.error("[UserStore] Error fetching Supabase profile:", err);
      set({
        supabaseProfile: null,
        isLoadingProfile: false,
        errorProfile: err.message || "Failed to fetch profile.",
      });
    }
  },

  clearSupabaseProfile: () => {
    console.log("[UserStore] Clearing Supabase profile.");
    set({ supabaseProfile: null, isLoadingProfile: false, errorProfile: null });
  },
}));

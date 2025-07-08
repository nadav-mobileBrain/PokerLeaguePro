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
  // Simplified version that returns default stats immediately
  // Remove this and restore full functionality after migration is applied
  const defaultStats: UserProfileStats = {
    total_games: 0,
    total_profit: 0,
    average_profit_per_game: 0,
    win_rate: 0,
    total_buy_ins: 0,
    best_single_game: 0,
    worst_single_game: 0,
  };

  console.log(
    "[useUserProfileStats] Using default stats (migration not applied)"
  );

  return {
    stats: defaultStats,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

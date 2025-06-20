import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";
import { League } from "@/types/database";
import appColors from "@/constants/colors";
export default function MyLeaguesScreen() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeagues = useCallback(async () => {
    // Get Supabase profile ID from the store
    const supabaseUserId = useUserStore.getState().supabaseProfile?.id;
    if (!supabaseUserId) {
      setError("User profile not loaded.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true); // Set loading true when starting fetch
    setError(null); // Clear previous errors

    try {
      // Fetch leagues where the user is a member
      // Need to join league_members table
      const { data: memberData, error: memberError } = await supabase
        .from("league_members")
        .select(
          `
          league_id,
          leagues (*) 
        `
        )
        .eq("user_id", supabaseUserId);

      if (memberError) throw memberError;

      const userLeagues = memberData
        ?.map((member: any) => member.leagues) // TODO: Type this properly if possible
        .filter((league): league is League => league !== null);

      setLeagues(userLeagues || []);
    } catch (e) {
      console.error("[MyLeaguesScreen] Error fetching leagues:", e);
      setError(e instanceof Error ? e.message : "An error occurred");
      setLeagues([]); // Clear leagues on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeagues();
    setRefreshing(false);
  }, [fetchLeagues]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const renderLeagueItem = ({ item }: { item: League }) => (
    <TouchableOpacity
      style={styles.leagueItem}
      onPress={() => router.push(`/league/${item.id}`)}>
      <Text style={styles.leagueName}>{item.name}</Text>
      {/* Access is_public directly */}
      <Text style={styles.leagueStatus}>
        {item.is_public ? "Public" : "Private"}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={appColors.buttonGreen} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error loading leagues: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leagues}
        renderItem={renderLeagueItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyText}>
              You haven't joined any leagues yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/join-league")}
              style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join or Create a League</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={appColors.lightText}
            colors={[appColors.buttonGreen]}
          />
        }
        contentContainerStyle={
          leagues.length === 0 ? styles.emptyListContainer : {}
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appColors.background,
    padding: 20,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 16,
    textAlign: "center",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: appColors.lightText,
    textAlign: "center",
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: appColors.buttonGreen,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  joinButtonText: {
    color: appColors.lightText,
    fontSize: 16,
    fontWeight: "bold",
  },
  leagueItem: {
    backgroundColor: appColors.chipBlack,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row", // Align items horizontally
    justifyContent: "space-between", // Space out name and status
    alignItems: "center",
  },
  leagueName: {
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.lightText,
  },
  leagueStatus: {
    fontSize: 14,
    color: appColors.secondaryText,
    fontStyle: "italic",
  },
});

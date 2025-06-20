import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { supabase } from "@/lib/supabaseClient";
import { LeagueMember, UserProfile } from "@/types/database";
import appColors from "@/constants/colors";
import { useUserStore } from "@/store/userStore";

export default function SelectPlayersScreen() {
  const { gameId, leagueId } = useLocalSearchParams<{
    gameId: string;
    leagueId: string;
  }>();
  const router = useRouter();
  const { supabaseProfile } = useUserStore();

  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const fetchLeagueMembers = useCallback(async () => {
    if (!leagueId) {
      setError("League ID is missing.");
      setIsLoading(false);
      return;
    }
    console.log(`[SelectPlayers] Fetching members for league ${leagueId}...`);
    setIsLoading(true);
    setError(null);

    try {
      const { data: memberData, error: memberError } = await supabase
        .from("league_members")
        .select(
          `
          user_id,
          role,
          joined_at,
          users (*) 
        `
        )
        .eq("league_id", leagueId);

      if (memberError) throw memberError;

      const formattedMembers: LeagueMember[] = (memberData || []).map(
        (m: any) => ({
          league_id: leagueId,
          user_id: m.user_id,
          role: m.role,
          joined_at: m.joined_at,
          users: m.users as UserProfile | null,
        })
      );
      setMembers(formattedMembers);
      console.log("[SelectPlayers] Members fetched:", formattedMembers.length);
    } catch (err: any) {
      console.error("[SelectPlayers] Error fetching members:", err);
      setError(err.message || "Failed to load league members.");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeagueMembers();
  }, [fetchLeagueMembers]);

  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayerIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleConfirmSelection = async () => {
    if (selectedPlayerIds.length === 0) {
      Alert.alert("No Players Selected", "Please select at least one player.");
      return;
    }

    if (!supabaseProfile?.id) {
      Alert.alert("Error", "User profile not available. Cannot add players.");
      return;
    }
    const callerId = supabaseProfile.id;

    console.log(
      `[SelectPlayers] Confirming selection for game ${gameId} with players: ${selectedPlayerIds.join(
        ", "
      )} by caller ${callerId}`
    );

    setIsLoading(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc("add_players_to_game", {
        p_game_id: gameId,
        p_player_ids: selectedPlayerIds,
        p_caller_id: callerId,
      });

      if (rpcError) throw rpcError;

      console.log("[SelectPlayers] Players inserted successfully via RPC.");

      router.replace({
        pathname: "/game/[gameId]",
        params: { gameId: gameId },
      });
    } catch (err: any) {
      Alert.alert("Error", "Failed to add players to the game.");
      console.error(
        "[SelectPlayers] Error calling add_players_to_game RPC:",
        err
      );
      const errorMessage =
        err.message ||
        (err.details
          ? `${err.message} (${err.details})`
          : "An unknown error occurred.");
      setError("Failed to save player selection. " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberItem = ({ item }: { item: LeagueMember }) => {
    const isSelected = selectedPlayerIds.includes(item.user_id);
    const displayName =
      item.users?.display_name || `User ${item.user_id.substring(0, 6)}`;

    return (
      <TouchableOpacity
        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
        onPress={() => togglePlayerSelection(item.user_id)}>
        <FontAwesome
          name={isSelected ? "check-square-o" : "square-o"}
          size={24}
          color={isSelected ? appColors.buttonGreen : appColors.secondaryText}
          style={styles.checkboxIcon}
        />
        <Text style={styles.memberName}>{displayName}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && members.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={appColors.buttonGreen} />
        <Text style={styles.loadingText}>Loading Members...</Text>
      </View>
    );
  }

  if (error && members.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={fetchLeagueMembers}
          color={appColors.buttonGreen}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Players for Game</Text>
      <Text style={styles.info}>Game ID: {gameId.substring(0, 8)}...</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading && (
        <ActivityIndicator
          style={styles.listLoadingIndicator}
          color={appColors.buttonGreen}
        />
      )}

      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.user_id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            No members found in this league.
          </Text>
        }
      />

      <View style={styles.buttonContainer}>
        <Button
          title={`Confirm ${selectedPlayerIds.length} Players & Start`}
          onPress={handleConfirmSelection}
          color={appColors.buttonGreen}
          disabled={isLoading || selectedPlayerIds.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    paddingTop: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appColors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: appColors.secondaryText,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  info: {
    fontSize: 14,
    color: appColors.secondaryText,
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    width: "100%",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  memberItemSelected: {
    backgroundColor: appColors.sectionBackground,
    borderLeftWidth: 4,
    borderLeftColor: appColors.buttonGreen,
    paddingHorizontal: 16,
  },
  checkboxIcon: {
    marginRight: 15,
  },
  memberName: {
    fontSize: 16,
    color: appColors.lightText,
    fontWeight: "500",
  },
  emptyListText: {
    fontSize: 16,
    color: appColors.secondaryText,
    textAlign: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: appColors.inputBorder,
    backgroundColor: appColors.background,
  },
  listLoadingIndicator: {
    marginVertical: 20,
  },
});

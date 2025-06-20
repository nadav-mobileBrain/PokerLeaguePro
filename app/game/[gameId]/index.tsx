import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity, // For Add button
  Button, // For Retry
  Alert, // <-- Added Alert import
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; // For icons
import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "@/types/database"; // Assuming UserProfile exists
import appColors from "@/constants/colors";
import { useUserStore } from "@/store/userStore"; // Import user store
import AddCashInModal from "@/components/game/AddCashInModal"; // <-- Import the modal
import CashOutModal from "@/components/game/CashOutModal"; // <-- Import the cash-out modal

// Interface for player data returned in the RPC player array
interface PlayerRpcData {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_cash_in: number;
  cash_out_amount?: number | null; // Added
  profit?: number | null; // Added
  cashed_out_at?: string | null; // Added (as ISO string)
}

// Combined interface for the data returned by the RPC
interface GameDataResponse {
  game: {
    game_id: string;
    game_name: string;
    game_location?: string;
    game_status: string;
    game_created_at: string;
    league_id: string;
    league_name: string;
    default_buy_in?: number;
    currency?: string;
  };
  players: PlayerRpcData[]; // Use the specific player interface
}

// Interface for player data used in the component state
interface PlayerDisplayData extends PlayerRpcData {
  // Extend the RPC data
  // Add any client-specific fields here if needed in the future
}

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { supabaseProfile } = useUserStore(); // Get user profile

  const [gameName, setGameName] = useState<string>("Game"); // Game state
  const [playersData, setPlayersData] = useState<PlayerDisplayData[]>([]); // Use PlayerDisplayData
  const [leagueDefaultBuyIn, setLeagueDefaultBuyIn] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] =
    useState<PlayerDisplayData | null>(null);
  const [isUndoing, setIsUndoing] = useState<string | null>(null); // Track which user's undo is in progress
  const [totalTableCashIn, setTotalTableCashIn] = useState<number>(0); // Total cash for active players

  // --- State for Cash Out Modal ---
  const [isCashOutModalVisible, setIsCashOutModalVisible] = useState(false);
  const [selectedPlayerForCashOut, setSelectedPlayerForCashOut] =
    useState<PlayerDisplayData | null>(null);
  const [isProcessingCashOut, setIsProcessingCashOut] = useState(false); // Loading state for cash out
  // --- End State for Cash Out Modal ---

  // --- State for End Game ---
  const [isEndingGame, setIsEndingGame] = useState(false); // Loading state for ending game
  // --- End State for End Game ---

  // --- Data Fetching Logic ---
  const fetchGameData = useCallback(async () => {
    if (!gameId) {
      setError("Game ID is missing.");
      setIsLoading(false);
      return;
    }
    if (!supabaseProfile?.id) {
      setError("User profile not loaded. Cannot fetch game data.");
      setIsLoading(false);
      return;
    }
    const requestingUserId = supabaseProfile.id;

    console.log(
      `[GameScreen] Fetching data for game ${gameId} by user ${requestingUserId}...`
    );
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("get_game_data", {
        p_game_id: gameId,
        p_requesting_user_id: requestingUserId,
      });

      if (rpcError) throw rpcError;

      // Cast the result
      const responseData = data as GameDataResponse | null;

      if (!responseData) {
        throw new Error(
          "No data returned or failed to cast from get_game_data RPC."
        );
      }

      console.log(
        "[GameScreen] Successfully fetched data via RPC:",
        responseData
      );

      setGameName(responseData.game.game_name || "Game");
      setLeagueDefaultBuyIn(responseData.game.default_buy_in ?? null);

      // Map player data, including new fields
      setPlayersData(
        responseData.players.map(
          (p: PlayerRpcData): PlayerDisplayData => ({
            // Use interfaces
            user_id: p.user_id,
            display_name: p.display_name || `User ${p.user_id.substring(0, 6)}`,
            avatar_url: p.avatar_url,
            total_cash_in: Number(p.total_cash_in ?? 0),
            cash_out_amount: p.cash_out_amount, // Map directly
            profit: p.profit, // Map directly
            cashed_out_at: p.cashed_out_at, // Map directly
          })
        )
      );
    } catch (err: any) {
      console.error("[GameScreen] Error fetching game data via RPC:", err);
      setError(err.message || "Failed to load game data.");
      setPlayersData([]);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, supabaseProfile?.id]);

  // --- Derived State --- Determines if all players have cashed out
  const allPlayersCashedOut =
    playersData.length > 0 &&
    playersData.every((p) => p.cash_out_amount !== null);

  // --- Effects ---
  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  // Effect to calculate total cash-in for *active* players
  useEffect(() => {
    const activeTotal = playersData
      .filter((player) => player.cash_out_amount === null) // Only count players who haven't cashed out
      .reduce((sum, player) => sum + player.total_cash_in, 0);
    setTotalTableCashIn(activeTotal);
  }, [playersData]);

  // --- Modal Handling ---
  const openCashInModal = (player: PlayerDisplayData) => {
    // Use PlayerDisplayData
    setSelectedPlayerForModal(player);
    setIsModalVisible(true);
  };

  const handleCashInUndo = (player: PlayerDisplayData) => {
    if (!gameId || !supabaseProfile?.id) {
      Alert.alert("Error", "Cannot perform undo: Missing game or user info.");
      return;
    }

    const requestingUserId = supabaseProfile.id;
    const playerToUndo = player.user_id;

    Alert.alert(
      "Confirm Undo",
      `Are you sure you want to undo the last cash-in for ${player.display_name}? This cannot be reverted.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Undo Last Cash-In",
          style: "destructive",
          onPress: async () => {
            console.log(
              `[GameScreen] Attempting undo for ${player.display_name} (User ID: ${playerToUndo})`
            );
            setIsUndoing(playerToUndo); // Set loading state for this specific user
            try {
              const { data: result, error: rpcError } = await supabase.rpc(
                "undo_last_cash_in",
                {
                  p_game_id: gameId,
                  p_user_id: playerToUndo,
                  p_requesting_user_id: requestingUserId,
                }
              );

              if (rpcError) throw rpcError;

              console.log(`[GameScreen] Undo RPC Result: ${result}`);
              Alert.alert("Success", result || "Undo operation completed.");
              fetchGameData(); // Refresh data after successful undo
            } catch (err: any) {
              console.error("[GameScreen] Error undoing cash-in:", err);
              Alert.alert(
                "Error Undoing",
                err.message || "Failed to undo the last cash-in."
              );
            } finally {
              setIsUndoing(null); // Clear loading state
            }
          },
        },
      ]
    );
  };

  const handleCashInAdded = () => {
    setIsModalVisible(false);
    setSelectedPlayerForModal(null);
    // Re-fetch data to update totals
    fetchGameData();
  };

  // --- Modal Handling (Cash Out) ---
  const openCashOutModal = (player: PlayerDisplayData) => {
    if (player.cash_out_amount !== null) {
      Alert.alert(
        "Already Cashed Out",
        `${player.display_name} has already cashed out.`
      );
      return;
    }
    setSelectedPlayerForCashOut(player);
    setIsCashOutModalVisible(true);
  };

  const handleCashOutSubmit = async (finalAmount: number) => {
    if (!selectedPlayerForCashOut || !gameId || !supabaseProfile?.id) {
      Alert.alert("Error", "Missing data for cash out operation.");
      return;
    }

    const playerToCashOut = selectedPlayerForCashOut;
    const totalCashIn = playerToCashOut.total_cash_in;
    const profit = finalAmount - totalCashIn;
    const requestingUserId = supabaseProfile.id;

    console.log(
      `[GameScreen] Attempting cash out for ${playerToCashOut.display_name} (User ID: ${playerToCashOut.user_id})`
    );
    setIsProcessingCashOut(true);

    try {
      const { data: result, error: rpcError } = await supabase.rpc(
        "record_player_cash_out",
        {
          p_game_id: gameId,
          p_user_id: playerToCashOut.user_id,
          p_cash_out_amount: finalAmount,
          p_profit: profit,
          p_requesting_user_id: requestingUserId,
        }
      );

      if (rpcError) throw rpcError;

      console.log("[GameScreen] Cash Out RPC Result:", result);
      Alert.alert(
        "Success",
        `${playerToCashOut.display_name} cash out recorded.`
      );

      // Close modal and refresh data
      setIsCashOutModalVisible(false);
      setSelectedPlayerForCashOut(null);
      fetchGameData(); // Refresh the list to show updated status
    } catch (err: any) {
      console.error("[GameScreen] Error recording cash out:", err);
      Alert.alert(
        "Error Recording Cash Out",
        err.message || "An unexpected error occurred."
      );
    } finally {
      setIsProcessingCashOut(false);
    }
  };
  // --- End Modal Handling (Cash Out) ---

  // --- Handle End Game ---
  const handleEndGame = async () => {
    if (!gameId || !supabaseProfile?.id) {
      Alert.alert("Error", "Missing game or user information.");
      return;
    }

    // Client-side sanity check: Sum of profits should be zero
    const profitSum = playersData.reduce((sum, p) => sum + (p.profit ?? 0), 0);
    const isMismatch = Math.abs(profitSum) > 0.01;
    let confirmMessage =
      "Are you sure you want to mark this game as completed? This cannot be undone directly.";
    let mismatchWarning = "";

    if (isMismatch) {
      mismatchWarning = `\n\nWarning: The calculated profit/loss sum is $${profitSum.toFixed(
        2
      )}, not zero. Check cash-out amounts if this seems incorrect.`;
      confirmMessage += mismatchWarning;
      // Log the warning but allow proceeding
      console.warn(
        `[GameScreen] Profit mismatch detected: ${profitSum.toFixed(2)}`
      );
    }

    Alert.alert(
      "Confirm End Game",
      confirmMessage, // Use the potentially updated message
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Game Anyway", // Adjusted text slightly
          style: "destructive",
          onPress: async () => {
            console.log(`[GameScreen] Attempting to end game ${gameId}`);
            setIsEndingGame(true);
            try {
              const { data: result, error: rpcError } = await supabase.rpc(
                "end_game",
                {
                  p_game_id: gameId,
                  p_requesting_user_id: supabaseProfile.id,
                }
              );

              if (rpcError) throw rpcError;

              console.log("[GameScreen] End Game RPC Result:", result);
              Alert.alert(
                "Game Ended",
                "The game has been marked as completed.",
                [
                  { text: "OK", onPress: () => router.back() }, // Navigate back on OK
                ]
              );
            } catch (err: any) {
              console.error("[GameScreen] Error ending game:", err);
              // Check if the error is our specific profit mismatch error from the backend
              if (err.message?.includes("Sum of player profits")) {
                Alert.alert(
                  "Server Validation Failed",
                  `Could not end game: ${err.message}`
                );
              } else {
                Alert.alert(
                  "Error Ending Game",
                  err.message ||
                    "An unexpected error occurred while trying to end the game."
                );
              }
            } finally {
              setIsEndingGame(false);
            }
          },
        },
      ]
    );
  };
  // --- End Handle End Game ---

  // --- Render Player Item ---
  const renderPlayerItem = ({ item }: { item: PlayerDisplayData }) => {
    const formattedCashIn = `$${Number(item.total_cash_in).toFixed(2)}`;
    const isCurrentlyUndoing = isUndoing === item.user_id;
    const hasCashedOut = item.cash_out_amount !== null; // Check if cashed out
    const profit = item.profit;
    const formattedProfit =
      profit !== null && profit !== undefined ? `$${profit.toFixed(2)}` : "N/A";
    const profitStyle =
      profit !== null && profit !== undefined
        ? profit >= 0
          ? styles.profitPositive
          : styles.profitNegative
        : styles.playerCashIn; // Default style if no profit

    return (
      <View style={styles.playerItem}>
        {/* Avatar (Optional) */}
        {/* <Image source={{ uri: item.avatar_url }} style={styles.avatar} /> */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.display_name}</Text>
          {hasCashedOut ? (
            <Text style={[styles.playerStatus, profitStyle]}>
              Cashed out: {formattedProfit}
            </Text>
          ) : (
            <Text style={styles.playerCashIn}>In for: {formattedCashIn}</Text>
          )}
        </View>
        <View style={styles.playerActions}>
          {!hasCashedOut && ( // Only show actions if not cashed out
            <>
              <TouchableOpacity
                style={styles.cashInButton}
                onPress={() => openCashInModal(item)}
                disabled={isCurrentlyUndoing || isProcessingCashOut} // Disable during undo or cash-out processing
              >
                <FontAwesome
                  name="plus-circle"
                  size={22}
                  color={appColors.buttonGreen}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.undoButton}
                onPress={() => handleCashInUndo(item)}
                disabled={isCurrentlyUndoing || isProcessingCashOut}>
                {isCurrentlyUndoing ? (
                  <ActivityIndicator
                    size="small"
                    color={appColors.secondaryText}
                  />
                ) : (
                  <FontAwesome
                    name="undo"
                    size={18}
                    color={appColors.secondaryText}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cashOutButton}
                onPress={() => openCashOutModal(item)}
                disabled={isCurrentlyUndoing || isProcessingCashOut}>
                {isProcessingCashOut &&
                selectedPlayerForCashOut?.user_id === item.user_id ? (
                  <ActivityIndicator size="small" color={appColors.accentRed} />
                ) : (
                  <FontAwesome
                    name="sign-out"
                    size={22}
                    color={appColors.accentRed}
                  />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // --- Main Render Logic ---
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
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={fetchGameData}
          color={appColors.buttonGreen}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: gameName }} />
      <FlatList
        data={playersData}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.user_id}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Players</Text>}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.placeholder}>
            No players found for this game.
          </Text>
        }
      />
      {/* Display Total Cash In (Only for active players) */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Active Table Cash:</Text>
        <Text style={styles.totalAmount}>${totalTableCashIn.toFixed(2)}</Text>
      </View>

      {/* --- Conditionally Render End Game Button --- */}
      {allPlayersCashedOut && (
        <TouchableOpacity
          style={[styles.endGameButton, isEndingGame && styles.buttonDisabled]}
          onPress={handleEndGame}
          disabled={isEndingGame}>
          {isEndingGame ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.endGameButtonText}>End Game</Text>
          )}
        </TouchableOpacity>
      )}
      {/* --- End Conditional Button --- */}

      {/* --- Render Add Cash-In Modal --- */}
      {selectedPlayerForModal && (
        <AddCashInModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          gameId={gameId}
          userId={selectedPlayerForModal.user_id}
          userName={selectedPlayerForModal.display_name}
          onCashInAdded={handleCashInAdded}
        />
      )}
      {/* --- End Add Cash-In Modal --- */}

      {/* --- Render Cash Out Modal --- */}
      {selectedPlayerForCashOut && (
        <CashOutModal
          isVisible={isCashOutModalVisible}
          onClose={() =>
            !isProcessingCashOut && setIsCashOutModalVisible(false)
          } // Prevent closing while processing
          onSubmit={handleCashOutSubmit}
          userName={selectedPlayerForCashOut.display_name}
          totalCashIn={selectedPlayerForCashOut.total_cash_in}
          // Pass loading state to modal if needed for disabling fields/button
          // isProcessing={isProcessingCashOut}
        />
      )}
      {/* --- End Cash Out Modal --- */}
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  centeredContainer: {
    // For loading/error
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: appColors.background,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: appColors.lightText,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
    paddingBottom: 10,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  playerInfo: {
    flex: 1, // Takes up available space
  },
  playerName: {
    color: appColors.lightText,
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 3,
  },
  playerCashIn: {
    color: appColors.secondaryText,
    fontSize: 14,
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align buttons to the right
  },
  cashInButton: {
    paddingVertical: 8,
    paddingHorizontal: 10, // Adjust padding
    borderRadius: 5,
    marginRight: 10, // Space between buttons
  },
  undoButton: {
    paddingVertical: 8,
    paddingHorizontal: 10, // Consistent padding
    marginRight: 10, // Space before cash out
  },
  cashOutButton: {
    // Style for the new button
    paddingVertical: 8,
    paddingHorizontal: 10, // Consistent padding
  },
  playerStatus: {
    // Combined style for status text
    fontSize: 14,
    fontStyle: "italic",
  },
  profitPositive: {
    // Style for positive profit
    color: appColors.buttonGreen,
    fontWeight: "500",
  },
  profitNegative: {
    // Style for negative profit
    color: appColors.accentRed,
    fontWeight: "500",
  },
  placeholder: {
    fontSize: 14,
    color: appColors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: appColors.inputBorder,
    backgroundColor: appColors.sectionBackground, // Slight background for emphasis
  },
  totalLabel: {
    // Adjusted total label style if needed
    fontSize: 16,
    fontWeight: "600",
    color: appColors.lightText,
  },
  totalAmount: {
    // Adjusted total amount style if needed
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.buttonGreen,
  },
  endGameButton: {
    backgroundColor: appColors.accentRed,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  endGameButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: appColors.secondaryText, // Grey out when disabled
  },
});

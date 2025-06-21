import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";
import appColors from "@/constants/colors"; // Ensure lowercase path
// Consider adding DateTimePicker for date/time input later
// import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateGameModal() {
  const { leagueId } = useLocalSearchParams<{ leagueId?: string }>();
  const router = useRouter();
  const { supabaseProfile } = useUserStore();
  const colorScheme = useColorScheme(); // Get current color scheme if needed later

  const [gameName, setGameName] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    if (!leagueId) {
      setError("League ID is missing. Cannot start game.");
      return;
    }
    if (!supabaseProfile?.id) {
      console.error(
        "[CreateGame] PRE-FLIGHT CHECK FAILED: supabaseProfile or supabaseProfile.id is missing.",
        supabaseProfile
      );
      setError("User profile not loaded. Cannot start game.");
      return;
    }
    const creatorId = supabaseProfile.id;
    console.log(
      `[CreateGame] PRE-FLIGHT CHECK PASSED: User ID ${creatorId} and League ID ${leagueId} are present.`
    );

    const finalGameName =
      gameName.trim() || `Game - ${new Date().toLocaleDateString()}`;
    const finalLocation = location.trim() || null;

    setIsLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      console.log(
        `[CreateGame] Attempting to create game for league ${leagueId} by user ${creatorId}`
      );

      // Call the RPC function to create the game
      const { data: newGameId, error: rpcError } = await supabase.rpc(
        "create_game",
        {
          p_league_id: leagueId,
          p_game_name: finalGameName,
          p_location: finalLocation,
          p_creator_id: creatorId,
        }
      );

      if (rpcError) throw rpcError;

      if (!newGameId) {
        throw new Error("RPC did not return a new game ID.");
      }

      console.log(
        `[CreateGame] Game created successfully via RPC with ID: ${newGameId}`
      );
      Alert.alert("Success", `Game "${finalGameName}" started!`);

      // Navigate to player selection screen
      router.replace({
        pathname: "/game/[gameId]/select-players",
        params: { gameId: newGameId, leagueId: leagueId },
      });
    } catch (err: any) {
      console.error("[CreateGame] Error starting game via RPC:", err);
      setError(err.message || "Failed to start game.");
      Alert.alert(
        "Error Starting Game",
        err.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Start New Game</Text>

        <Text style={styles.label}>Game Name (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder={`Defaults to "Game - ${new Date().toLocaleDateString()}"`}
          placeholderTextColor={appColors.secondaryText} // Use imported colors
          value={gameName}
          onChangeText={setGameName}
          editable={!isLoading}
        />

        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., John's place, Poker Club"
          placeholderTextColor={appColors.secondaryText} // Use imported colors
          value={location}
          onChangeText={setLocation}
          editable={!isLoading}
        />

        {/* TODO: Add DateTimePicker for start_time if needed */}
        {/* TODO: Add initial player selection */}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator color={appColors.buttonGreen} /> // Use imported colors
        ) : (
          <Button
            title="Start Game"
            onPress={handleStartGame}
            color={appColors.buttonGreen} // Use imported colors
          />
        )}

        {/* Add a cancel button */}
        {!isLoading && (
          <View style={{ marginTop: 15 }}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              color={appColors.cancelButtonBackground} // Use imported colors
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: appColors.background, // Use imported colors
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: appColors.lightText, // Use imported colors
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: appColors.secondaryText, // Use imported colors
  },
  input: {
    backgroundColor: appColors.inputBackground, // Use imported colors
    borderWidth: 1,
    borderColor: appColors.inputBorder, // Use imported colors
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: appColors.lightText, // Use imported colors
  },
  errorText: {
    color: appColors.accentRed, // Use imported colors
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
});

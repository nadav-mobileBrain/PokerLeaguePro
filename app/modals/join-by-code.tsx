import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/clerk-expo"; // To get current user
import { League } from "@/types/database";
import { useUserStore } from "@/store/userStore"; // Import Zustand store
import appColors from "@/constants/colors"; // Import centralized colors

export default function JoinByCodeModal() {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  // Get profile and loading state from Zustand
  const { supabaseProfile, isLoadingProfile, errorProfile } = useUserStore();

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code.");
      return;
    }
    if (!isSignedIn || !supabaseProfile?.id) {
      setError(
        "You must be signed in and your profile loaded to join a league."
      );
      return;
    }

    const codeToSubmit = inviteCode.trim().toUpperCase();
    setIsLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      // 1. Find league by invite code using RPC
      console.log(
        `[JoinByCode] Looking for league with code: ${codeToSubmit} via RPC`
      );
      const { data: leagueResult, error: rpcError } = await supabase.rpc(
        "find_league_by_invite_code",
        { p_invite_code: codeToSubmit }
      );

      if (rpcError) throw rpcError;

      // RPC returns an array, even if empty or single result
      const leagueData = leagueResult?.[0]; // Get the first element if it exists

      if (!leagueData) {
        throw new Error(
          "Invalid invite code. Please check the code and try again."
        );
      }

      console.log(
        `[JoinByCode] Found league via RPC: ${leagueData.name} (ID: ${leagueData.id})`
      );
      const leagueId = leagueData.id;
      const leagueName = leagueData.name;

      // 2. Check if user is already a member
      console.log(
        `[JoinByCode] Checking membership for user ${supabaseProfile.id} in league ${leagueId}`
      );
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("league_members")
        .select("user_id")
        .eq("league_id", leagueId)
        .eq("user_id", supabaseProfile.id)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (existingMember) {
        Alert.alert(
          "Already Joined",
          `You are already a member of "${leagueName}".`
        );
        router.replace({
          pathname: "/(tabs)/league/[leagueId]",
          params: { leagueId: leagueId },
        });
        return; // Stop execution
      }

      // 3. Add user to league
      console.log(
        `[JoinByCode] Adding user ${supabaseProfile.id} to league ${leagueId}`
      );
      const { error: insertError } = await supabase
        .from("league_members")
        .insert({
          league_id: leagueId,
          user_id: supabaseProfile.id,
          role: "member", // Default role when joining by code
        });

      if (insertError) throw insertError;

      // 4. Success
      Alert.alert("Success!", `You have joined the league: "${leagueName}"`);
      router.replace({
        pathname: "/(tabs)/league/[leagueId]",
        params: { leagueId: leagueId },
      });
    } catch (err: any) {
      console.error("[JoinByCode] Error joining league by code:", err);
      setError(err.message || "An unexpected error occurred.");
      Alert.alert(
        "Error Joining",
        err.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (errorProfile && !supabaseProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading profile: {errorProfile}
        </Text>
        <Text>Please try logging out and back in.</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to join a league.</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Join League by Code</Text>
        <Text style={styles.label}>Enter Invite Code:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., L-ABC123"
          placeholderTextColor={appColors.secondaryText} // Use imported colors
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters" // Helps with code entry
          maxLength={8} // Example length L- + 6 chars
          editable={!isLoading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator color={appColors.buttonGreen} /> // Use imported colors
        ) : (
          <Button
            title="Join League"
            onPress={handleJoin}
            disabled={!inviteCode.trim()}
            color={appColors.buttonGreen} // Use imported colors
          />
        )}

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
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Adjust padding for modal presentation
    backgroundColor: appColors.background, // Dark background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: appColors.lightText, // Light text
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: appColors.secondaryText, // Muted grey for labels
  },
  input: {
    backgroundColor: appColors.inputBackground, // Dark input bg
    borderWidth: 1,
    borderColor: appColors.inputBorder, // Muted border
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center", // Center align for code input
    letterSpacing: 3, // Add some spacing for code
    color: appColors.lightText, // Light text for input value
  },
  errorText: {
    color: appColors.accentRed, // Use accent red for errors
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: appColors.secondaryText, // Muted grey for info
    textAlign: "center",
    marginBottom: 20,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabaseClient";
import { League, LeagueMember, UserProfile } from "@/types/database";
import { useUserStore } from "@/store/userStore";
import { FontAwesome } from "@expo/vector-icons";
import appColors from "@/constants/colors"; // Import centralized colors

export default function JoinLeagueScreen() {
  const { leagueId } = useLocalSearchParams<{ leagueId?: string }>();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { supabaseProfile, isLoadingProfile, errorProfile } = useUserStore();
  const router = useRouter();

  const [league, setLeague] = useState<League | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const loadLeagueAndCheckMembership = async () => {
      if (!isAuthLoaded || isLoadingProfile) return; // Wait for auth and profile

      if (!leagueId) {
        setError("No league specified.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsMember(null);

      try {
        // Fetch league details
        const { data: leagueData, error: leagueError } = await supabase
          .from("leagues")
          .select("*")
          .eq("id", leagueId)
          .single();

        if (leagueError) throw leagueError;
        if (!leagueData) throw new Error("League not found.");
        setLeague(leagueData as League);

        // Check membership status if user is signed in and profile loaded
        if (isSignedIn && supabaseProfile?.id) {
          const { data: memberData, error: memberError } = await supabase
            .from("league_members")
            .select("user_id")
            .eq("league_id", leagueId)
            .eq("user_id", supabaseProfile.id)
            .maybeSingle();

          if (memberError) throw memberError;
          setIsMember(!!memberData);
        } else {
          setIsMember(false); // Not a member if not signed in/profile loaded
        }
      } catch (err: any) {
        console.error("[JoinLeague] Error loading league:", err);
        setError(err.message || "Failed to load league information.");
        setLeague(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeagueAndCheckMembership();
  }, [leagueId, isAuthLoaded, isSignedIn, supabaseProfile, isLoadingProfile]);

  const handleJoinLeague = async () => {
    if (
      !leagueId ||
      !league ||
      !isSignedIn ||
      !supabaseProfile?.id ||
      isMember
    ) {
      Alert.alert(
        "Cannot Join",
        "Unable to join league. Missing info, already a member, or not signed in."
      );
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("league_members")
        .insert({
          league_id: leagueId,
          user_id: supabaseProfile.id,
          role: "member", // Default role when joining via link
        });

      if (insertError) throw insertError;

      Alert.alert("Success!", `You have joined the league: "${league.name}"`);
      setIsMember(true);

      if (typeof leagueId === "string") {
        router.replace({
          pathname: `/(tabs)/league/[leagueId]`,
          params: { leagueId },
        });
      } else {
        console.warn(
          "[JoinLeague] leagueId is not a string after join, cannot navigate."
        );
        router.back(); // Fallback navigation
      }
    } catch (err: any) {
      console.error("[JoinLeague] Error joining league:", err);
      setError(err.message || "An unexpected error occurred while joining.");
      Alert.alert("Error Joining", err.message || "Failed to join the league.");
    } finally {
      setIsJoining(false);
    }
  };

  // --- Render different states ---

  if (isLoading || !isAuthLoaded || isLoadingProfile) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={appColors.buttonGreen} />
        <Text style={styles.loadingText}>Loading League Info...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!league) {
    // This case should ideally be covered by the error state from fetch
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>League information not available.</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.infoText}>
          Please sign in to join "{league.name}".
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isMember === true) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.infoText}>
          You are already a member of "{league?.name || "this league"}".
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (typeof leagueId === "string") {
              router.replace({
                pathname: `/(tabs)/league/[leagueId]`,
                params: { leagueId },
              });
            } else {
              router.back(); // Fallback
            }
          }}
          style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Go to League</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Default: Show league info and Join button
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join League</Text>

      <View style={styles.leagueInfoBox}>
        {league.banner_url ? (
          <Image
            source={{ uri: league.banner_url }}
            style={styles.bannerImage}
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <FontAwesome
              name="group"
              size={50}
              color={appColors.secondaryText}
            />
          </View>
        )}
        <View style={styles.leagueDetails}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <Text style={styles.leagueDescription} numberOfLines={3}>
            {league.description || "No description."}
          </Text>
          <Text style={styles.leagueStatus}>
            {league.is_public ? "Public League" : "Private League"}
          </Text>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isJoining ? (
        <ActivityIndicator
          size="large"
          color={appColors.buttonGreen}
          style={{ marginTop: 20 }}
        />
      ) : (
        <TouchableOpacity
          onPress={handleJoinLeague}
          style={styles.buttonPrimary}
          disabled={isJoining}>
          <Text style={styles.buttonPrimaryText}>Join "{league.name}"</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.buttonSecondary}
        disabled={isJoining}>
        <Text style={styles.buttonSecondaryText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: appColors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: appColors.background,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: appColors.secondaryText,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: appColors.lightText,
    textAlign: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: appColors.lightText,
    textAlign: "center",
    marginBottom: 30,
  },
  leagueInfoBox: {
    backgroundColor: appColors.sectionBackground,
    borderRadius: 8,
    marginBottom: 30,
    overflow: "hidden", // Clip banner
  },
  bannerImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: appColors.chipBlack,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  leagueDetails: {
    padding: 15,
  },
  leagueName: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 8,
  },
  leagueDescription: {
    fontSize: 14,
    color: appColors.secondaryText,
    marginBottom: 10,
    lineHeight: 20,
  },
  leagueStatus: {
    fontSize: 14,
    color: appColors.accentGold, // Highlight status
    fontStyle: "italic",
  },
  buttonPrimary: {
    backgroundColor: appColors.buttonGreen,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  buttonPrimaryText: {
    color: appColors.lightText,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: appColors.chipBlack, // Less prominent
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    alignItems: "center",
    width: "100%",
  },
  buttonSecondaryText: {
    color: appColors.secondaryText,
    fontSize: 16,
  },
});

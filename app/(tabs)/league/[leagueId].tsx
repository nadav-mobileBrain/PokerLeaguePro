import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";
import { League, LeagueMember, UserProfile } from "@/types/database";
import { FontAwesome } from "@expo/vector-icons"; // For icons
import appColors from "@/constants/colors"; // Import centralized colors (corrected case)

// Helper function to format currency (example)
const formatCurrency = (amount: number | null, currencyCode = "USD") => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

export default function LeagueDetailScreen() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const { supabaseProfile } = useUserStore();
  const router = useRouter();

  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCheckingForOpenGame, setIsCheckingForOpenGame] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  console.log("leakkgueId", leagueId);

  const fetchLeagueDetails = useCallback(async () => {
    if (!leagueId) {
      setError("League ID is missing.");
      setIsLoading(false);
      return;
    }
    // Ensure user profile is loaded to get the requesting user ID
    if (!supabaseProfile?.id) {
      setError("User profile not loaded. Cannot fetch league details.");
      // Optionally wait for profile or show specific message
      setIsLoading(false);
      return;
    }
    const requestingUserId = supabaseProfile.id;

    console.log(
      `[LeagueDetail] Fetching details for league ${leagueId} via RPC by user ${requestingUserId}...`
    );
    setIsLoading(true);
    setIsCheckingForOpenGame(true);
    setError(null);

    try {
      // Fetch league details using the RPC function
      const { data: leagueDataArray, error: rpcError } = await supabase.rpc(
        "get_league_details",
        {
          p_league_id: leagueId,
          p_requesting_user_id: requestingUserId,
        }
      );

      if (rpcError) throw rpcError;

      // RPC returns SETOF, so result is an array. Expecting 0 or 1 item.
      if (!leagueDataArray || leagueDataArray.length === 0) {
        throw new Error("League not found or access denied via RPC.");
      }

      const leagueData = leagueDataArray[0]; // Get the single league object

      setLeague(leagueData as League);
      console.log("[LeagueDetail] League data fetched via RPC:", leagueData);

      // Fetch league members and their profiles
      console.log(`[LeagueDetail] Fetching members for league ${leagueId}...`);
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

      // Map fetched data to LeagueMember type before setting state
      const formattedMembers: LeagueMember[] = (memberData || []).map(
        (m: any) => ({
          league_id: leagueId, // Add the leagueId back
          user_id: m.user_id,
          role: m.role,
          joined_at: m.joined_at,
          users: m.users as UserProfile | null, // Assert nested user profile type
        })
      );

      setMembers(formattedMembers);
      console.log(
        "[LeagueDetail] Member data formatted and set:",
        formattedMembers
      );

      // Check admin status (using formattedMembers now)
      if (supabaseProfile?.id) {
        const currentUserMember = formattedMembers.find(
          (m) => m.user_id === supabaseProfile.id
        );
        setIsAdmin(currentUserMember?.role === "league_admin");
        console.log(
          "[LeagueDetail] Current user admin status:",
          currentUserMember?.role === "league_admin"
        );
      }

      // Check for active game
      console.log(
        `[LeagueDetail] Checking for active game in league ${leagueId} via RPC...`
      );
      const { data: gameIdResult, error: gameCheckError } = await supabase.rpc(
        "check_for_active_game",
        {
          p_league_id: leagueId,
          p_requesting_user_id: requestingUserId,
        }
      );

      if (gameCheckError) {
        console.warn(
          "[LeagueDetail] Error checking for active game:",
          gameCheckError.message
        );
        setActiveGameId(null);
      } else {
        console.log("[LeagueDetail] Active game check result:", gameIdResult);
        setActiveGameId(gameIdResult);
      }
    } catch (err: any) {
      console.error("[LeagueDetail] Error during fetchLeagueDetails:", err);
      setError(err.message || "Failed to load league details.");
      setLeague(null);
      setMembers([]);
      setActiveGameId(null);
    } finally {
      setIsLoading(false);
      setIsCheckingForOpenGame(false);
    }
  }, [leagueId, supabaseProfile?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeagueDetails();
    setRefreshing(false);
  }, [fetchLeagueDetails]);

  useEffect(() => {
    fetchLeagueDetails();
  }, [fetchLeagueDetails]);

  const handleStartGame = async () => {
    if (isCheckingForOpenGame) return;

    if (activeGameId) {
      console.log(
        `[LeagueDetail] Active game ${activeGameId} exists. Navigating...`
      );
      router.push({
        pathname: "/game/[gameId]",
        params: { gameId: activeGameId },
      });
    } else {
      if (!leagueId) {
        Alert.alert("Error", "League ID is missing, cannot create game.");
        return;
      }
      console.log(
        `[LeagueDetail] No active game found. Proceeding to create game.`
      );
      router.push({
        pathname: "/modals/create-game",
        params: { leagueId: leagueId },
      });
    }
  };

  // --- Modified Invite Member Function (Shares Code) ---
  const handleShareInviteCode = async () => {
    if (!league?.invite_code) {
      Alert.alert("No Code", "Invite code not available for this league.");
      return;
    }

    const message = `Join my poker league "${league.name}" on PokerLeaguePro! Use this invite code: ${league.invite_code}`;

    try {
      const result = await Share.share({
        message: message,
        title: `Invite to ${league.name}`, // Optional: Title for the share dialog
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via specific activity
          console.log("Shared code via", result.activityType);
        } else {
          // Shared successfully
          console.log("Shared invite code");
        }
      } else if (result.action === Share.dismissedAction) {
        // Share dialog dismissed (iOS only)
        console.log("Share dismissed");
      }
    } catch (error: any) {
      Alert.alert("Error Sharing", error.message);
    }
  };
  // --------------------------------------------------

  // --- Copy Invite Code Function (Keep as is) ---
  const handleCopyCode = async () => {
    if (!league?.invite_code) return;
    await Clipboard.setString(league.invite_code);
    setCopied(true);
    Alert.alert("Copied!", "Invite code copied to clipboard.");
    // Reset copied state after a delay
    setTimeout(() => setCopied(false), 2000);
  };
  // ----------------------------

  // --- Render Logic ---
  if (isLoading && !refreshing) {
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
        <TouchableOpacity
          onPress={fetchLeagueDetails}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!league) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>League not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={appColors.lightText}
          colors={[appColors.buttonGreen]}
        />
      }>
      {/* Dynamic Title using Stack.Screen options */}
      <Stack.Screen options={{ title: league.name || "League Details" }} />

      {/* League Banner */}
      {league.banner_url ? (
        <Image source={{ uri: league.banner_url }} style={styles.bannerImage} />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <FontAwesome name="group" size={50} color={appColors.secondaryText} />
        </View>
      )}

      <View style={styles.contentPadding}>
        {/* League Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>League Info</Text>
          <Text style={styles.leagueDescription}>
            {league.description || "No description provided."}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>
              {league.is_public ? "Public" : "Private"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Default Buy-in:</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(league.default_buy_in, league.currency)}
            </Text>
          </View>
          {league.invite_code && (
            <View style={[styles.infoRow, styles.inviteCodeRow]}>
              <Text style={styles.infoLabel}>Invite Code:</Text>
              <View style={styles.inviteCodeValueContainer}>
                <Text style={styles.inviteCodeText}>{league.invite_code}</Text>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={styles.copyButton}>
                  <FontAwesome
                    name={copied ? "check-square-o" : "copy"}
                    size={18}
                    color={appColors.secondaryText}
                  />
                  <Text style={styles.copyButtonText}>
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {league.invite_code && (
            <TouchableOpacity
              onPress={handleShareInviteCode}
              style={styles.shareInviteButton}>
              <FontAwesome
                name="share-alt"
                size={16}
                color={appColors.lightText}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.shareInviteButtonText}>
                Share Invite Code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (isLoading || isCheckingForOpenGame) &&
                styles.actionButtonDisabled,
            ]}
            onPress={handleStartGame}
            disabled={isLoading || isCheckingForOpenGame}>
            {isLoading || isCheckingForOpenGame ? (
              <ActivityIndicator
                size="small"
                color={appColors.lightText}
                style={styles.actionIcon}
              />
            ) : (
              <FontAwesome
                name={activeGameId ? "sign-in" : "play-circle"}
                size={20}
                color={appColors.lightText}
                style={styles.actionIcon}
              />
            )}
            <Text style={styles.actionButtonText}>
              {activeGameId ? "Join Game" : "Start New Game"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() =>
              router.push({
                pathname: "/league-stats",
                params: { leagueId: league.id },
              })
            }>
            <FontAwesome
              name="bar-chart"
              size={20}
              color={appColors.lightText}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonText}>View Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Member List Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
          {members.length > 0 ? (
            members.map((member) => (
              <View key={member.user_id} style={styles.memberItem}>
                <Text style={styles.memberName}>
                  {member.users?.display_name ||
                    `User ${member.user_id.substring(0, 6)}`}
                </Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>No members found.</Text>
          )}
        </View>

        {/* TODO: Add Games List Section */}
        {/* <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            <Text style={styles.placeholderText}>[Game list]</Text>
        </View> */}
      </View>
    </ScrollView>
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
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: appColors.buttonGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: appColors.lightText,
    fontSize: 16,
    fontWeight: "bold",
  },
  bannerImage: {
    width: "100%",
    height: 150, // Adjust as needed
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: appColors.chipBlack,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  contentPadding: {
    padding: 15,
  },
  sectionContainer: {
    backgroundColor: appColors.sectionBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.accentGold, // Use gold for titles
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
    paddingBottom: 5,
  },
  leagueDescription: {
    fontSize: 16,
    color: appColors.lightText,
    marginBottom: 15,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inviteCodeRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 15,
    color: appColors.secondaryText,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: appColors.lightText,
  },
  inviteCodeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  inviteCodeText: {
    fontSize: 16,
    color: appColors.accentGold,
    fontWeight: "bold",
    letterSpacing: 1,
    marginRight: 10,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  copyButtonText: {
    marginLeft: 5,
    fontSize: 13,
    color: appColors.secondaryText,
  },
  shareInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.secondaryText,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  shareInviteButtonText: {
    color: appColors.background,
    fontSize: 15,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: appColors.chipBlack,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: appColors.inputBorder,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: appColors.buttonGreen,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    backgroundColor: appColors.secondaryText,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: appColors.lightText,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: appColors.primary, // A different color for secondary actions
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  memberName: {
    fontSize: 16,
    color: appColors.lightText,
    fontWeight: "500",
  },
  memberRole: {
    fontSize: 14,
    color: appColors.secondaryText,
    fontStyle: "italic",
  },
  placeholderText: {
    fontSize: 14,
    color: appColors.secondaryText,
    textAlign: "center",
    marginTop: 10,
  },
  titleContainer: {
    padding: 20,
    backgroundColor: appColors.chipBlack, // To make text readable over banner edge
  },
  leagueName: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.lightText,
  },
  description: {
    fontSize: 16,
    color: appColors.lightText,
  },
});

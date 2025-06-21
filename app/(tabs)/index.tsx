import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Platform,
  Pressable,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo"; // Import useAuth
import React, { useEffect, useState, useCallback } from "react"; // Add React import
import { useUserLeagues } from "@/hooks/useUserLeagues"; // Import the new hook
import { League } from "@/types/database"; // Import the League type
import { useRouter } from "expo-router"; // Import useRouter
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";
import appColors from "@/constants/colors"; // Import centralized colors
import { useRecentGames } from "@/hooks/useRecentGames"; // Import the recent games hook
import RecentGameItem from "@/components/game/RecentGameItem"; // Import the recent game item component

export default function HomeScreen() {
  const { user: clerkUser } = useUser(); // Keep clerk user for display
  const { signOut, isLoaded: isClerkLoaded } = useAuth(); // Keep clerk auth state
  const {
    leagues,
    isLoading: isLoadingLeagues,
    error: leaguesError,
    refetch: refetchLeagues,
  } = useUserLeagues(); // Use the leagues hook
  const {
    games: recentGames,
    isLoading: isLoadingGames,
    error: gamesError,
    refetch: refetchGames,
  } = useRecentGames(); // Use the recent games hook
  const router = useRouter(); // Initialize router
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Parallel fetch
      await Promise.all([refetchLeagues(), refetchGames()]);
    } catch (error) {
      console.error("Failed to refresh data", error);
      // Optionally show an alert to the user
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchLeagues, refetchGames]);

  const handleSignOut = async () => {
    console.log("Attempting Sign Out...");
    try {
      await signOut();
      console.log("Sign Out successful");
      // No need to navigate here, RootLayout useEffect will handle redirect
    } catch (err: any) {
      console.error("Error signing out:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Sign Out Error",
        err.errors?.[0]?.message || "Could not sign out."
      );
    }
  };

  const renderLeagueItem = ({ item }: { item: League }) => (
    <Pressable
      style={({ pressed }) => [
        styles.leagueItem,
        pressed && styles.leagueItemPressed,
      ]}
      onPress={() => router.push(`/league/${item.id}`)}>
      {item.banner_url ? (
        <Image source={{ uri: item.banner_url }} style={styles.leagueBanner} />
      ) : (
        <Image
          source={{
            uri: "https://uuuetroiqvycucxckwrg.supabase.co/storage/v1/object/public/league-banners/public/1234/cards.png",
          }}
          style={styles.leagueBanner}
        />
      )}
      <View style={styles.leagueInfoContainer}>
        <Text style={styles.leagueName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.leagueDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {/* Add more info like member count if available */}
      </View>
    </Pressable>
  );

  const ListHeader = () => (
    <View style={styles.headerFooterContainer}>
      <View style={styles.userInfoSection}>
        {!isClerkLoaded ? (
          <ActivityIndicator size="small" color={appColors.secondaryText} />
        ) : clerkUser ? (
          <>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: clerkUser.imageUrl }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{clerkUser.fullName || "N/A"}</Text>
              <Text style={styles.userHandle}>
                {clerkUser.username ||
                  clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] ||
                  "Player"}
              </Text>
            </View>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.signOutButtonPressed,
              ]}>
              <Text style={styles.signOutButtonText}>Exit</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.placeholderText}>User not loaded</Text>
        )}
      </View>

      <Text style={styles.title}>Home Dashboard</Text>
      <Text style={styles.sectionTitle}>Active Leagues</Text>
    </View>
  );

  const ListFooter = () => {
    // Render other sections only if leagues are loaded successfully
    if (isLoadingLeagues) return null; // Don't show footer while leagues are loading
    if (leaguesError) return null;

    return (
      <View style={styles.headerFooterContainer}>
        {/* Recent Sessions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {isLoadingGames ? (
            <ActivityIndicator color={appColors.secondaryText} />
          ) : gamesError ? (
            <Text style={styles.errorText}>{gamesError.message}</Text>
          ) : recentGames.length > 0 ? (
            <FlatList
              horizontal
              data={recentGames}
              renderItem={({ item }) => <RecentGameItem item={item} />}
              keyExtractor={(item) => item.game_id}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          ) : (
            <Text style={styles.placeholderText}>No recent games found.</Text>
          )}
        </View>

        {/* Other sections can be added below */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <Text style={styles.placeholderText}>Total P/L: $XXX.XX</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Games</Text>
          <Text style={styles.placeholderText}>
            [Game X (Tomorrow), Game Y (Next Week)]
          </Text>
        </View> */}
      </View>
    );
  };

  // --- Loading and Error States ---
  if (isLoadingLeagues) {
    // Show a basic loading indicator, header will be added by FlatList later if needed
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={appColors.buttonGreen} />
        <Text style={styles.loadingText}>Loading Leagues...</Text>
      </View>
    );
  }

  if (leaguesError) {
    // Show error message, maybe include header for context?
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Error loading leagues:{" "}
          {leaguesError?.message || "An unknown error occurred"}
        </Text>
        {/* Retry logic might need adjustment based on the hook */}
      </View>
    );
  }

  // --- Main Render with FlatList as root scroll ---
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.listContentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={appColors.lightText}
          colors={[appColors.buttonGreen]}
        />
      }>
      <ListHeader />
      {leagues.length > 0 ? (
        <FlatList
          horizontal
          data={leagues}
          renderItem={renderLeagueItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.horizontalListContentContainer}
        />
      ) : (
        <View style={styles.emptyListCenteredContainer}>
          <Text style={styles.emptyText}>No leagues found.</Text>
          <Text style={styles.emptySubText}>
            Create one or join using an invite code!
          </Text>
          {/* Optional: Add Create/Join buttons here */}
        </View>
      )}
      <ListFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  listContentContainer: {
    // Style for the FlatList's inner container
    paddingBottom: 20, // Add padding at the bottom
  },
  horizontalListContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerFooterContainer: {
    // Container for header/footer content
    paddingHorizontal: 20, // Match original ScrollView padding
    paddingTop: 20, // Add top padding
  },
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    padding: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: appColors.accentGold,
    marginBottom: 20,
    transform: [{ rotate: "-1deg" }],
    ...Platform.select({
      ios: {
        shadowColor: appColors.accentGold,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarContainer: {
    borderWidth: 3,
    borderColor: appColors.buttonGreen,
    borderRadius: 30,
    padding: 2,
    transform: [{ rotate: "2deg" }],
    backgroundColor: appColors.background,
    ...Platform.select({
      ios: {
        shadowColor: appColors.buttonGreen,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: appColors.chipBlack,
  },
  userInfoText: {
    flex: 1,
    marginLeft: 12,
    transform: [{ rotate: "1deg" }],
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: appColors.lightText,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: appColors.buttonGreen,
    fontWeight: "800",
    fontStyle: "italic",
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: appColors.accentRed,
    borderWidth: 2,
    borderColor: appColors.lightText,
    borderRadius: 8,
    transform: [{ rotate: "2deg" }],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  signOutButtonPressed: {
    transform: [{ rotate: "2deg" }, { scale: 0.95 }],
  },
  signOutButtonText: {
    color: appColors.lightText,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
    color: appColors.buttonGreen,
    textTransform: "uppercase",
    transform: [{ rotate: "-1deg" }],
  },
  section: {
    marginBottom: 20,
    backgroundColor: "transparent",
    padding: 0,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 15,
    color: appColors.accentGold,
    textTransform: "uppercase",
    transform: [{ rotate: "1deg" }],
  },
  placeholderText: {
    fontSize: 16,
    color: appColors.secondaryText,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: appColors.secondaryText,
    fontWeight: "bold",
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  retryButton: {
    backgroundColor: appColors.buttonGreen,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: appColors.lightText,
  },
  retryButtonText: {
    color: appColors.lightText,
    fontSize: 16,
    fontWeight: "900",
  },
  centeredContainer: {
    // Used for full-screen loading/error states
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: appColors.background,
  },
  emptyListCenteredContainer: {
    // Used specifically for ListEmptyComponent content
    flexGrow: 1, // Allows centering within FlatList space
    justifyContent: "center",
    alignItems: "center",
    padding: 40, // Add more padding for empty state
    minHeight: 300, // Ensure it takes up some space
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "900",
    color: appColors.lightText,
    marginBottom: 10,
    textTransform: "uppercase",
    transform: [{ rotate: "-2deg" }],
  },
  emptySubText: {
    fontSize: 16,
    color: appColors.secondaryText,
    textAlign: "center",
    fontWeight: "bold",
    transform: [{ rotate: "1deg" }],
  },
  leagueItem: {
    backgroundColor: appColors.chipBlack,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: appColors.buttonGreen,
    overflow: "hidden",
    width: 280,
    transform: [{ rotate: "-1deg" }],
    ...Platform.select({
      ios: {
        shadowColor: appColors.buttonGreen,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  leagueItemPressed: {
    transform: [{ rotate: "-1deg" }, { scale: 0.98 }],
  },
  leagueBanner: {
    width: "100%",
    height: 120,
    borderBottomWidth: 3,
    borderBottomColor: appColors.buttonGreen,
  },
  leagueInfoContainer: {
    padding: 15,
  },
  leagueName: {
    fontSize: 20,
    fontWeight: "900",
    color: appColors.lightText,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  leagueDescription: {
    fontSize: 14,
    color: appColors.secondaryText,
    fontWeight: "bold",
  },
  separator: {
    width: 15, // Use width for horizontal spacing
  },
});

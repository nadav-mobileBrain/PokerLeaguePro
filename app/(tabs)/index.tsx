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
    <TouchableOpacity
      style={styles.leagueItem}
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
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.headerFooterContainer}>
      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        {!isClerkLoaded ? (
          <ActivityIndicator size="small" color={appColors.secondaryText} />
        ) : clerkUser ? (
          <>
            <Image source={{ uri: clerkUser.imageUrl }} style={styles.avatar} />
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{clerkUser.fullName || "N/A"}</Text>
              <Text style={styles.userEmail}>
                {clerkUser.primaryEmailAddress?.emailAddress || "No Email"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutButton}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>User not loaded</Text>
        )}
      </View>

      <Text style={styles.title}>Home Dashboard</Text>

      {/* Title for the leagues list itself */}
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
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
    minHeight: 60,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: appColors.chipBlack, // Placeholder background
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.lightText,
  },
  userEmail: {
    fontSize: 14,
    color: appColors.secondaryText,
  },
  signOutButton: {
    marginLeft: "auto", // Push button to the right
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: appColors.accentRed, // Red color for sign out
    borderRadius: 5,
  },
  signOutButtonText: {
    color: appColors.lightText,
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: appColors.buttonGreen,
    // Removed paddingHorizontal as it's handled by headerFooterContainer
  },
  section: {
    marginBottom: 20,
    backgroundColor: "transparent", // Make section background transparent
    padding: 0, // Remove padding, item will handle it
    borderRadius: 8,
    // Removed shadow styles for consistency, can be added back if needed
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: appColors.accentGold,
    // Removed paddingHorizontal as it's handled by headerFooterContainer/section padding
  },
  placeholderText: {
    fontSize: 14,
    color: appColors.secondaryText,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: appColors.secondaryText,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: appColors.secondaryText,
    textAlign: "center",
  },
  leagueItem: {
    backgroundColor: appColors.chipBlack,
    borderRadius: 8,
    borderColor: appColors.primary,
    borderWidth: 1,
    overflow: "hidden",
    width: 280, // Set a fixed width for horizontal items
  },
  leagueBanner: {
    width: "100%",
    height: 100, // Adjust height as needed
  },
  leagueBannerPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: appColors.inputBorder, // Placeholder color
    justifyContent: "center",
    alignItems: "center",
  },
  leagueInfoContainer: {
    padding: 15,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 5,
  },
  leagueDescription: {
    fontSize: 14,
    color: appColors.secondaryText,
  },
  separator: {
    width: 15, // Use width for horizontal spacing
  },
});

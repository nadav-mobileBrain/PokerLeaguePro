import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { League } from "@/types/database";
import appColors from "@/constants/colors";
import { useUserLeagues } from "@/hooks/useUserLeagues"; // Import the hook

const LeagueItem = ({ item, router }: { item: League; router: any }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.leagueItem}
      onPress={() => router.push(`/league/${item.id}`)}>
      <Image
        source={{
          uri: imageError
            ? "https://uuuetroiqvycucxckwrg.supabase.co/storage/v1/object/public/league-banners/public/1234/cards.png"
            : item.banner_url ||
              `https://uuuetroiqvycucxckwrg.supabase.co/storage/v1/object/public/league-banners/public/${item.id}/banner.jpg`,
        }}
        style={styles.leagueBanner}
        onError={() => setImageError(true)}
      />
      <View style={styles.leagueInfoContainer}>
        <Text style={styles.leagueName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.leagueDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MyLeaguesScreen() {
  const router = useRouter();
  const {
    leagues,
    isLoading,
    error,
    refetch: onRefresh, // Use refetch directly for onRefresh
  } = useUserLeagues(); // Use the centralized hook

  const renderLeagueItem = ({ item }: { item: League }) => (
    <LeagueItem item={item} router={router} />
  );

  if (isLoading && leagues.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={appColors.buttonGreen} />
        <Text style={styles.loadingText}>Loading Your Leagues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leagues}
        renderItem={renderLeagueItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.createLeagueButton}
              onPress={() => router.push("/(tabs)/create-league")}>
              <Text style={styles.createLeagueButtonText}>
                + Create a New League
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
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
            refreshing={isLoading} // The hook's loading state can drive the spinner
            onRefresh={onRefresh}
            tintColor={appColors.lightText}
            colors={[appColors.buttonGreen]}
          />
        }
        contentContainerStyle={[
          styles.listContentContainer,
          leagues.length === 0 ? styles.emptyListContainer : {},
        ]}
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
    padding: 20,
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
  },
  listContentContainer: {
    paddingTop: 10,
    paddingBottom: 20,
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
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  leagueBanner: {
    width: "100%",
    height: 100,
  },
  leagueBannerPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: appColors.inputBorder,
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
    height: 10,
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 10,
  },
  createLeagueButton: {
    backgroundColor: appColors.buttonGreen,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  createLeagueButtonText: {
    color: appColors.lightText,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import appColors from "@/constants/colors";
import { useLeagueStats, StatPlayer } from "@/hooks/useLeagueStats";

const formatCurrency = (amount: number) => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const StatCard = ({
  title,
  player,
}: {
  title: string;
  player: StatPlayer | null;
}) => {
  if (!player) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.playerName}>No data available</Text>
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.playerName}>{player.display_name}</Text>
        <Text style={styles.profitText}>{formatCurrency(player.profit)}</Text>
      </View>
      <Image
        source={{
          uri:
            player.avatar_url ||
            "https://uuuetroiqvycucxckwrg.supabase.co/storage/v1/object/public/avatars/public/default-avatar.png",
        }}
        style={styles.avatar}
      />
    </View>
  );
};

export default function LeagueStatsScreen() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const { stats, isLoading, error, refetch } = useLeagueStats(leagueId);

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
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={appColors.lightText}
        />
      }>
      <Stack.Screen options={{ title: "League Statistics" }} />
      {stats && (
        <>
          <StatCard title="League Leader" player={stats.league_leader} />
          <StatCard
            title="Top Single Game Profit"
            player={stats.top_single_game_profit}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollContentContainer: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appColors.background,
  },
  errorText: {
    color: appColors.accentRed,
    fontSize: 16,
    padding: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: appColors.chipBlack,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: appColors.secondaryText,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 4,
  },
  profitText: {
    fontSize: 18,
    color: appColors.lightText,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 16,
  },
});

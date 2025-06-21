import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useStatDetails, StatDetailPlayer } from "@/hooks/useStatDetails";
import appColors from "@/constants/colors";

const formatCurrency = (amount: number) => {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const PlayerRow = ({
  item,
  index,
}: {
  item: StatDetailPlayer;
  index: number;
}) => (
  <View style={styles.playerRow}>
    <Text style={styles.playerRank}>{index + 1}</Text>
    <Image
      source={{
        uri:
          item.avatar_url ||
          "https://uuuetroiqvycucxckwrg.supabase.co/storage/v1/object/public/avatars/public/default-avatar.png",
      }}
      style={styles.avatar}
    />
    <Text style={styles.playerName} numberOfLines={1}>
      {item.display_name}
    </Text>
    <Text
      style={[
        styles.playerValue,
        item.value > 0
          ? styles.profitPositive
          : item.value < 0
          ? styles.profitNegative
          : styles.profitNeutral,
      ]}>
      {formatCurrency(item.value)}
    </Text>
  </View>
);

export default function StatDetailsScreen() {
  const { statType, leagueId } = useLocalSearchParams<{
    statType: string;
    leagueId: string;
  }>();
  const { data, title, isLoading, error, refetch } = useStatDetails(
    statType,
    leagueId
  );

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
    <View style={styles.container}>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <PlayerRow item={item} index={index} />
        )}
        keyExtractor={(item) => item.user_id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={appColors.lightText}
          />
        }
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.errorText}>No data available.</Text>
          </View>
        }
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
    backgroundColor: appColors.background,
    padding: 20,
  },
  errorText: {
    color: appColors.secondaryText,
    fontSize: 16,
    textAlign: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.inputBorder,
  },
  playerRank: {
    color: appColors.secondaryText,
    fontSize: 16,
    width: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerName: {
    color: appColors.lightText,
    fontSize: 16,
    flex: 1,
  },
  playerValue: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 70,
    textAlign: "right",
  },
  profitPositive: {
    color: appColors.buttonGreen,
  },
  profitNegative: {
    color: appColors.accentRed,
  },
  profitNeutral: {
    color: appColors.secondaryText,
  },
});

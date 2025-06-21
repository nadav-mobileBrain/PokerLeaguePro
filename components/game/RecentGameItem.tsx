import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { RecentGame } from "@/hooks/useRecentGames"; // Import the type
import appColors from "@/constants/colors";

interface RecentGameItemProps {
  item: RecentGame;
}

const RecentGameItem: React.FC<RecentGameItemProps> = ({ item }) => {
  const router = useRouter();

  const navigateToGame = () => {
    router.push(`/game/${item.game_id}`);
  };

  const formattedDate = new Date(item.game_created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const profitStyle =
    item.profit === null || item.profit === undefined
      ? styles.profitNeutral
      : item.profit > 0
      ? styles.profitPositive
      : item.profit < 0
      ? styles.profitNegative
      : styles.profitNeutral;

  const formattedProfit =
    item.profit === null || item.profit === undefined
      ? "N/A"
      : `${item.profit > 0 ? "+" : ""}$${item.profit.toFixed(2)}`;

  return (
    <TouchableOpacity style={styles.container} onPress={navigateToGame}>
      <View style={styles.iconContainer}>
        <Image
          source={require("@/assets/icons/cards.png")}
          style={{ width: 50, height: 50 }}
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.gameName}>{item.game_name}</Text>
        <Text style={styles.leagueName}>League: {item.league_name}</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
        {item.profit !== null && (
          <View style={styles.profitContainer}>
            <Text style={[styles.profitText, profitStyle]}>
              {formattedProfit}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            item.game_status === "completed"
              ? styles.statusCompleted
              : styles.statusInProgress,
          ]}>
          {item.game_status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    padding: 12,
    borderRadius: 8,
    borderColor: appColors.inputBorder,
    borderWidth: 2,
    width: 280,
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  gameName: {
    fontSize: 14,
    fontWeight: "bold",
    color: appColors.lightText,
  },
  leagueName: {
    fontSize: 13,
    color: appColors.secondaryText,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: appColors.secondaryText,
    marginTop: 4,
  },
  profitContainer: {
    marginTop: 8,
  },
  profitText: {
    fontSize: 16,
    fontWeight: "bold",
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
  statusContainer: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: appColors.background,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusInProgress: {
    color: appColors.accentRed,
  },
  statusCompleted: {
    color: appColors.buttonGreen,
  },
});

export default RecentGameItem;

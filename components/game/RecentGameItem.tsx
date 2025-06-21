import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from "react-native";
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
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={navigateToGame}>
      <View style={styles.iconContainer}>
        <Image
          source={require("@/assets/icons/cards.png")}
          style={styles.icon}
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.chipBlack,
    padding: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: appColors.buttonGreen,
    width: 280,
    marginBottom: 15,
    transform: [{ rotate: "1deg" }],
    ...Platform.select({
      ios: {
        shadowColor: appColors.buttonGreen,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  containerPressed: {
    transform: [{ rotate: "1deg" }, { scale: 0.98 }],
  },
  iconContainer: {
    marginRight: 15,
    borderWidth: 2,
    borderColor: appColors.accentGold,
    borderRadius: 12,
    padding: 8,
    backgroundColor: appColors.background,
    transform: [{ rotate: "-3deg" }],
  },
  icon: {
    width: 40,
    height: 40,
  },
  detailsContainer: {
    flex: 1,
    transform: [{ rotate: "-1deg" }],
  },
  gameName: {
    fontSize: 18,
    fontWeight: "900",
    color: appColors.lightText,
    textTransform: "uppercase",
  },
  leagueName: {
    fontSize: 14,
    color: appColors.secondaryText,
    marginTop: 4,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    color: appColors.secondaryText,
    marginTop: 4,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  profitContainer: {
    marginTop: 8,
    backgroundColor: appColors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: appColors.inputBorder,
  },
  profitText: {
    fontSize: 16,
    fontWeight: "900",
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: appColors.background,
    borderWidth: 2,
    borderColor: appColors.inputBorder,
    transform: [{ rotate: "-2deg" }],
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusInProgress: {
    color: appColors.accentRed,
  },
  statusCompleted: {
    color: appColors.buttonGreen,
  },
});

export default RecentGameItem;

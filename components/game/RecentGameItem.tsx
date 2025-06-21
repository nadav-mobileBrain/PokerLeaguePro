import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { RecentGame } from "@/hooks/useRecentGames"; // Import the type
import appColors from "@/constants/colors";
import { FontAwesome } from "@expo/vector-icons";

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

  return (
    <TouchableOpacity style={styles.container} onPress={navigateToGame}>
      <View style={styles.iconContainer}>
        <FontAwesome name="gamepad" size={24} color={appColors.buttonGreen} />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.gameName} numberOfLines={1}>
          {item.game_name}
        </Text>
        <Text style={styles.leagueName} numberOfLines={1}>
          League: {item.league_name}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
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
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
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

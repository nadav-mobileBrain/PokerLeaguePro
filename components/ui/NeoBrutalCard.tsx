import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import appColors from "@/constants/colors";

interface NeoBrutalCardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "dark";
}

export const NeoBrutalCard: React.FC<NeoBrutalCardProps> = ({
  title,
  children,
  style,
  variant = "primary",
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return appColors.chipBlack;
      case "secondary":
        return appColors.chipBlack;
      case "dark":
        return "#000";
      default:
        return appColors.text;
    }
  };

  return (
    <View style={[styles.cardShadow, { backgroundColor: "#000" }, style]}>
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: getBackgroundColor() },
        ]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 12,
    padding: 4,
    transform: [{ translateX: 4 }, { translateY: 4 }],
    marginBottom: 20,
  },
  cardContainer: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    padding: 16,
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.warning,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 8,
  },
});

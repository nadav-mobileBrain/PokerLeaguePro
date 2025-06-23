import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import appColors from "@/constants/colors";

interface NeoBrutalButtonProps {
  onPress: () => void;
  text: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "info";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NeoBrutalButton: React.FC<NeoBrutalButtonProps> = ({
  onPress,
  text,
  icon,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return appColors.buttonSuccess;
      case "secondary":
        return appColors.accentBlue;
      case "danger":
        return appColors.accentRed;
      case "info":
        return appColors.warning;
      default:
        return appColors.buttonSuccess;
    }
  };

  return (
    <View
      style={[
        styles.buttonContainer,
        disabled && styles.disabled,
        { backgroundColor: disabled ? appColors.secondaryText : "#000" },
        style,
      ]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, { backgroundColor: getBackgroundColor() }]}>
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, textStyle]}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    padding: 4,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  button: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  disabled: {
    opacity: 0.7,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: appColors.lightText,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from "react-native";

// Import the default export
import appColors from "@/constants/colors";

// This hook might need refactoring or removal depending on theme strategy.
// It was designed for a light/dark object structure.
export function useThemeColor(
  props: { light?: string; dark?: string },
  // colorName mapping needs to be adjusted based on appColors structure
  // Using a simple placeholder type for now
  colorName: keyof typeof appColors
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Fallback logic needs update.
  // For now, just return a specific color from appColors if the key exists,
  // otherwise a default grey.
  // This isn't ideal theme handling.
  return appColors[colorName] || "#CCCCCC";
}

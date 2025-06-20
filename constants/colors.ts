/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Define app colors based on colors.md and usage
const appColors = {
  // Core Palette
  background: "#0C0C0C", // Almost black
  cardFeltGreen: "#006400", // Deep casino green (for felt/table elements if needed)
  accentRed: "#C0392B", // Rich red (errors, danger, sign out)
  accentGold: "#FFD700", // Luxurious gold (highlights, important numbers, section titles)
  lightText: "#F2F2F2", // Off-white (primary text)
  secondaryText: "#A0A0A0", // Muted grey (subtext, hints, borders, inactive elements)
  buttonGreen: "#27AE60", // Fresh green (primary buttons, active elements)
  chipBlack: "#1C1C1C", // Dark element (card backgrounds, list items, inputs)

  // UI Element Specific Aliases (using core palette)
  inputBackground: "#1C1C1C", // Chip Black
  inputBorder: "#A0A0A0", // Secondary Text
  cancelButtonBackground: "#A0A0A0", // Secondary Text
  switchThumbColor: "#f4f3f4", // Default light thumb
  switchTrackColorFalse: "#767577", // Default dark track
  switchTrackColorTrue: "#27AE60", // Button Green
  imagePickerButtonBG: "#A0A0A0", // Secondary Text
  imagePickerButtonText: "#0C0C0C", // Background (for contrast)
  removeImageButtonBG: "#C0392B", // Accent Red
  removeImageButtonText: "#F2F2F2", // Light Text
  linkText: "#27AE60", // Button Green
  tabBarBackground: "#1C1C1C", // Chip Black / Card
  tabBarActiveTint: "#27AE60", // Button Green / Primary
  tabBarInactiveTint: "#A0A0A0", // Secondary Text
  sectionBackground: "#1C1C1C", // Added this line (using Chip Black)

  // Theme Colors (for react-navigation ThemeProvider)
  card: "#1C1C1C", // Chip Black
  text: "#F2F2F2", // Light Text
  border: "#A0A0A0", // Secondary Text
  primary: "#27AE60", // Button Green
  notification: "#C0392B", // Accent Red
};

export default appColors;

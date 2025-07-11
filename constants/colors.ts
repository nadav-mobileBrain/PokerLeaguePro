/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

/**
 * Color palette combining poker aesthetics with neo-brutalism design.
 * Neo-brutalism features:
 * - High contrast colors
 * - Raw, unrefined look
 * - Bold, solid colors
 * - Sharp shadows and borders
 */

// Core Palette
const appColors = {
  // Primary Colors
  background: "#000000", // Pure black for maximum contrast
  chipBlack: "#1A1A1A", // Slightly lighter black for cards/chips
  feltGreen: "#006B3C", // Rich poker table green

  // Neo-Brutal Accents
  accentRed: "#FF3B30", // Vibrant red for errors/warnings
  accentBlue: "#0A84FF", // Electric blue for interactions
  accentYellow: "#FFD60A", // Bright yellow for highlights
  accentPink: "#FF2D55", // Neo-brutal pink for special elements

  // Text Colors
  lightText: "#FFFFFF", // Pure white for maximum readability
  secondaryText: "#8E8E93", // Neutral gray for secondary information

  // UI Elements
  buttonPrimary: "#FF6B6B", // Neo-brutal red for primary actions
  buttonSecondary: "#4ECDC4", // Teal for secondary actions
  buttonDanger: "#FF4949", // Bright red for dangerous actions
  buttonSuccess: "#2ECC71", // Bright green for success states

  // Card & Input Elements
  cardBackground: "#1C1C1E", // Dark surface for cards
  inputBackground: "#2C2C2E", // Slightly lighter for input fields
  inputBorder: "#3A3A3C", // Border color for inputs

  // Status Colors
  success: "#4CD964", // Neo-brutal green
  error: "#FF3B30", // Neo-brutal red
  warning: "#FFCC00", // Neo-brutal yellow
  info: "#5856D6", // Neo-brutal purple

  // Game Elements
  pokerChipPrimary: "#FF453A", // Red chip
  pokerChipSecondary: "#30D158", // Green chip
  pokerChipTertiary: "#0A84FF", // Blue chip
  chipGold: "#FFD700", // Gold chip for special roles/admin

  // Functional Colors
  tabBarBackground: "#1C1C1E",
  tabBarActiveTint: "#30D158", // Neo-brutal red
  tabBarInactiveTint: "#8E8E93",
  linkText: "#0A84FF",
  switchTrackColorTrue: "#4CD964",
  switchTrackColorFalse: "#3A3A3C",
  switchThumbColor: "#FFFFFF",

  // Theme Colors (for react-navigation)
  card: "#1C1C1E",
  text: "#FFFFFF",
  border: "#3A3A3C",
  primary: "#FF6B6B",
  notification: "#FF3B30",

  // Neo-brutal Shadows (use these in components)
  shadowLight: "#FFFFFF33",
  shadowDark: "#00000066",
};

export default appColors;

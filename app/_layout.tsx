import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import {
  Platform,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Text,
  View,
} from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { tokenCache, webTokenCache } from "@/utils/tokenCache";
import { useUserStore } from "@/store/userStore";
import appColors from "@/constants/colors";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Determine the correct cache based on platform
const platformTokenCache = Platform.OS === "web" ? webTokenCache : tokenCache;

// Create custom dark theme by merging with default DarkTheme
const PokerDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: appColors.primary,
    background: appColors.background,
    card: appColors.card,
    text: appColors.text,
    border: appColors.border,
    notification: appColors.notification,
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  const {
    ensureUserProfile,
    clearSupabaseProfile,
    supabaseProfile,
    onboardingCompleted,
  } = useUserStore();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [authLoopCount, setAuthLoopCount] = useState(0);
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    BlackOpsOne: require("../assets/fonts/BlackOpsOne-Regular.ttf"),
  });

  useEffect(() => {
    console.log("[Clerk Layout Effect] Running...");
    if (!fontsLoaded || !isLoaded) {
      console.log("[Clerk Layout Effect] Waiting for Fonts/Clerk...");
      // Track auth loops - if we're stuck here too long, show debug option
      setAuthLoopCount((prev) => {
        const newCount = prev + 1;
        if (newCount > 10) {
          setShowDebugButton(true);
        }
        return newCount;
      });
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn) {
      setAuthLoopCount(0); // Reset loop count on successful auth
      setShowDebugButton(false);
      if (!onboardingCompleted) {
        // If onboarding is not complete, redirect to the onboarding screen,
        // but only if not already there.
        if (segments[1] !== "onboarding") {
          router.replace("/(auth)/onboarding");
        }
      } else {
        // If onboarding is complete and user is in auth group, move them to the main app.
        if (inAuthGroup) {
          router.replace("/(tabs)/" as any);
        }
      }
    } else {
      // If user is not signed in, and not in the auth group, redirect to sign-in.
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    }

    if (fontsLoaded && isLoaded) {
      console.log("[Clerk Layout Effect] Hiding splash screen.");
      SplashScreen.hideAsync();
    }
  }, [
    fontsLoaded,
    isLoaded,
    isSignedIn,
    segments,
    router,
    onboardingCompleted,
  ]);

  useEffect(() => {
    if (isSignedIn && clerkUserId) {
      console.log(
        "[Layout Effect] User signed in, ensuring Supabase profile..."
      );
      ensureUserProfile(clerkUserId).catch((error) => {
        console.error("[Layout Effect] Failed to ensure user profile:", error);
      });
    } else if (!isSignedIn) {
      console.log(
        "[Layout Effect] User signed out, clearing Supabase profile..."
      );
      clearSupabaseProfile();
    }
  }, [isSignedIn, clerkUserId, ensureUserProfile, clearSupabaseProfile]);

  const handleClearTokens = async () => {
    Alert.alert(
      "Clear Authentication",
      "This will clear all stored authentication tokens and restart the app. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Tokens",
          style: "destructive",
          onPress: async () => {
            try {
              await platformTokenCache.clearAllTokens();
              clearSupabaseProfile();
              Alert.alert("Success", "Tokens cleared. Restarting app...", [
                {
                  text: "OK",
                  onPress: () => {
                    // Force a reload by updating state
                    setAuthLoopCount(0);
                    setShowDebugButton(false);
                  },
                },
              ]);
            } catch (error) {
              console.error("Failed to clear tokens:", error);
              Alert.alert(
                "Error",
                "Failed to clear tokens. Please restart the app manually."
              );
            }
          },
        },
      ]
    );
  };

  if (!fontsLoaded || !isLoaded) {
    return showDebugButton ? (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: appColors.background,
          padding: 20,
        }}>
        <Text
          style={{
            color: appColors.lightText,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 20,
          }}>
          App appears to be stuck loading...
        </Text>
        <TouchableOpacity
          onPress={handleClearTokens}
          style={{
            backgroundColor: appColors.buttonDanger,
            padding: 15,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: "#000",
          }}>
          <Text
            style={{
              color: appColors.lightText,
              fontSize: 16,
              fontWeight: "bold",
            }}>
            Clear Auth & Restart
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? PokerDarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modals/join-by-code"
          options={{
            presentation: "modal",
            title: "Join League",
          }}
        />
        <Stack.Screen
          name="modals/create-game"
          options={{
            presentation: "modal",
            title: "Start New Session",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: appColors.background }}>
      <ClerkProvider
        tokenCache={platformTokenCache}
        publishableKey={CLERK_PUBLISHABLE_KEY!}>
        <InitialLayout />
      </ClerkProvider>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import appColors from "@/constants/colors";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";

// Recommended practice, use a hook for the redirect URL
const useWarmUpBrowser = () => {
  React.useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [isLoading, setIsLoading] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [clerkId, setClerkId] = useState("");

  const handleGoogleSignIn = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive, signUp } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/oauth-native-callback"),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });

        // Get user ID from signUp if it's a new user
        const userId = signUp?.createdUserId;

        if (userId) {
          // Check if user exists in our database
          const { data: existingUser } = await supabase
            .from("users")
            .select("display_name")
            .eq("clerk_id", userId)
            .single();

          if (!existingUser) {
            // New user - show nickname modal
            setClerkId(userId);
            setShowNicknameModal(true);
          } else {
            router.replace("/(tabs)");
          }
        } else {
          // Existing user, no need for nickname
          router.replace("/(tabs)");
        }
      }
    } catch (err) {
      console.error("OAuth error", err);
      Alert.alert(
        "Error",
        "Something went wrong during sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow]);

  const handleNicknameSubmit = async () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || !clerkId) return;

    if (trimmedNickname.length < 2) {
      Alert.alert(
        "Invalid Nickname",
        "Nickname must be at least 2 characters long"
      );
      return;
    }

    try {
      setIsLoading(true);

      // Check if nickname is already taken
      const { data: existingNickname } = await supabase
        .from("users")
        .select("id")
        .eq("display_name", trimmedNickname)
        .single();

      if (existingNickname) {
        Alert.alert("Nickname Taken", "Please choose a different nickname");
        return;
      }

      // Create user profile
      const { error: createError } = await supabase.from("users").insert({
        clerk_id: clerkId,
        display_name: trimmedNickname,
      });

      if (createError) throw createError;

      setShowNicknameModal(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving nickname:", error);
      Alert.alert("Error", "Failed to save nickname. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Welcome to</Text>
        <Text style={styles.headerSubtitle}>Poker League Pro</Text>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/icons/app_icon.png")}
          style={styles.logo}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}>
        <FontAwesome name="google" size={20} color={appColors.lightText} />
        <Text style={styles.buttonText}>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Text>
        {isLoading && <ActivityIndicator color={appColors.lightText} />}
      </TouchableOpacity>

      <Modal
        visible={showNicknameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNicknameModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Nickname</Text>
            <Text style={styles.modalSubtitle}>
              This will be your display name in the app
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter nickname"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />

            <TouchableOpacity
              style={[styles.button, !nickname.trim() && styles.buttonDisabled]}
              onPress={handleNicknameSubmit}
              disabled={!nickname.trim() || isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? "Saving..." : "Continue"}
              </Text>
              {isLoading && <ActivityIndicator color={appColors.lightText} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: appColors.background,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 60,
    backgroundColor: appColors.accentYellow,
    paddingVertical: 20,
    paddingHorizontal: 30,
    transform: [{ rotate: "-4deg" }],
    borderWidth: 4,
    borderColor: appColors.chipBlack,
    borderRadius: 12,
    shadowColor: appColors.chipBlack,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: appColors.chipBlack,
    fontFamily: "SpaceMono",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 48,
    color: appColors.chipBlack,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: -4,
    fontFamily: "SpaceMono",
    transform: [{ rotate: "2deg" }],
  },
  logoContainer: {
    marginBottom: 70,
    padding: 10,
    backgroundColor: appColors.accentPink,
    borderRadius: 100, // Make it a circle
    borderWidth: 4,
    borderColor: appColors.chipBlack,
    transform: [{ rotate: "5deg" }],
    shadowColor: appColors.chipBlack,
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80, // Half of width/height
    borderWidth: 4,
    borderColor: appColors.chipBlack,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.accentBlue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: appColors.chipBlack,
    gap: 12,
    minWidth: 320,
    shadowColor: appColors.chipBlack,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: appColors.secondaryText,
  },
  buttonText: {
    color: appColors.lightText,
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    fontFamily: "SpaceMono",
    letterSpacing: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalContent: {
    backgroundColor: appColors.feltGreen,
    padding: 24,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: appColors.chipBlack,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: appColors.chipBlack,
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
    color: appColors.lightText,
    textTransform: "uppercase",
    fontFamily: "SpaceMono",
    letterSpacing: 1,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: appColors.lightText,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "SpaceMono",
  },
  input: {
    width: "100%",
    borderWidth: 4,
    borderColor: appColors.chipBlack,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 18,
    backgroundColor: appColors.background,
    color: appColors.lightText,
    fontFamily: "SpaceMono",
    shadowColor: appColors.chipBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});

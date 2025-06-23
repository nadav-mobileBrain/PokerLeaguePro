import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import appColors from "@/constants/colors";

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
  const [loading, setLoading] = React.useState(false);

  const onOAuthSignInPress = React.useCallback(async () => {
    try {
      setLoading(true);
      const redirectUrl = Linking.createURL("/auth-callback");
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/" as any);
      }
    } catch (err: any) {
      console.error("OAuth error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Sign In Error",
        err.errors?.[0]?.message || "Could not sign in with Google."
      );
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, router]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require("@/assets/icons/app_icon.png")}
          style={styles.appIcon}
          resizeMode="contain"
        />
        <Text style={styles.header}>PokerLeaguePro</Text>
        <Text style={styles.description}>Welcome to the Game</Text>

        {loading ? (
          <ActivityIndicator size="large" color={appColors.feltGreen} />
        ) : (
          <TouchableOpacity
            style={styles.googleButton}
            onPress={onOAuthSignInPress}
            activeOpacity={0.8}>
            <FontAwesome
              name="google"
              size={24}
              color={appColors.accentYellow}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    justifyContent: "center",
    padding: 20,
  },
  contentContainer: {
    alignItems: "center",
    transform: [{ rotate: "-2deg" }],
  },
  appIcon: {
    width: 180,
    height: 180,
    marginBottom: 20,
    transform: [{ rotate: "4deg" }],
    borderWidth: 4,
    borderColor: appColors.accentYellow,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: appColors.success,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    fontSize: 42,
    fontWeight: "900",
    color: appColors.success,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  description: {
    fontSize: 24,
    color: appColors.accentYellow,
    marginBottom: 40,
    fontWeight: "700",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appColors.accentBlue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: appColors.success,
    transform: [{ rotate: "2deg" }],
    ...Platform.select({
      ios: {
        shadowColor: appColors.success,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: appColors.success,
    fontSize: 20,
    fontWeight: "800",
  },
});

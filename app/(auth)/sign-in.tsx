import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import appColors from "@/constants/colors";

// Recommended practise, use a hook for the redirect URL
const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the browser to avoid delays
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser(); // Warm up browser
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    console.log("Attempting Sign In with:", emailAddress);
    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("Sign In Complete, session active.");
        router.replace("/(tabs)/" as any);
      } else {
        console.error(
          "Sign In Status Not Complete:",
          JSON.stringify(signInAttempt, null, 2)
        );
        alert(
          "Sign in process not complete. Please check logs or handle other factors."
        );
      }
    } catch (err: any) {
      console.error("Sign In Error:", JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || "Error during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignInPress = React.useCallback(async () => {
    try {
      // Define the redirect URL for the OAuth flow
      const redirectUrl = Linking.createURL("/auth-callback");
      console.log("OAuth Redirect URL:", redirectUrl);

      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({ redirectUrl });
      console.log("OAuth Flow Result:", {
        createdSessionId,
        signInStatus: signIn?.status,
        signUpStatus: signUp?.status,
      });

      if (createdSessionId && setActive) {
        // If createdSessionId exists, user signed in successfully
        await setActive({ session: createdSessionId });
        console.log("OAuth session activated successfully.");
        router.replace("/(tabs)/" as any); // Navigate to main app
      } else {
        // Handle other scenarios like sign-up completion needed (rare with Google)
        // Or errors within the flow not caught by the catch block
        console.warn(
          "OAuth flow finished, but no session ID created or setActive missing."
        );
        // You might need specific handling for signIn?.firstFactorVerification etc.
        // if MFA or other steps are required, but typically not for Google OAuth.
      }
    } catch (err: any) {
      console.error("OAuth error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Sign In Error",
        err.errors?.[0]?.message || "Could not sign in with Google."
      );
    }
  }, [startOAuthFlow, router]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.header}>PokerLeaguePro</Text>
        <Text style={styles.description}>Sign In or Sign Up</Text>

        {loading ? (
          <ActivityIndicator
            style={styles.spinner}
            color={appColors.buttonGreen}
          />
        ) : (
          <>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Button
                title="Sign in"
                disabled={loading}
                onPress={onSignInPress}
                color={appColors.buttonGreen}
              />
            </View>
            {/* <View style={styles.verticallySpaced}>
              <Button
                title="Sign up"
                disabled={loading}
                onPress={() => router.push("/(auth)/sign-up")}
                color={appColors.secondaryText}
              />
            </View> */}
            <View style={styles.verticallySpaced}>
              <TouchableOpacity
                style={styles.button}
                onPress={onOAuthSignInPress}>
                <FontAwesome
                  name="google"
                  size={18}
                  color="#ffffff"
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: appColors.background,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: appColors.lightText,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: appColors.secondaryText,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: appColors.secondaryText,
  },
  input: {
    backgroundColor: appColors.inputBackground,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: appColors.lightText,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  spinner: {
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "stretch",
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

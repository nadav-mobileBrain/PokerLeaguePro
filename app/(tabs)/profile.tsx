import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import {
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import "react-native-get-random-values";
import { decode } from "base64-arraybuffer";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";
import { useUserProfileStats } from "@/hooks/useUserProfileStats";
import appColors from "@/constants/colors";
import { NeoBrutalCard } from "@/components/ui/NeoBrutalCard";
import { NeoBrutalButton } from "@/components/ui/NeoBrutalButton";

export default function ProfileScreen() {
  const { signOut, userId } = useAuth();
  const { supabaseProfile, ensureUserProfile, updateUserAvatar } =
    useUserStore();
  const { stats, isLoading: statsLoading } = useUserProfileStats(
    supabaseProfile?.id
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingImageBase64, setPendingImageBase64] = useState<string | null>(
    null
  );
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserProfile = async () => {
      if (!userId) return;

      try {
        await ensureUserProfile(userId);
      } catch (error) {
        console.error("Failed to initialize user profile:", error);
      }
    };

    initializeUserProfile();
  }, [userId]);

  useEffect(() => {
    if (supabaseProfile?.avatar_url) {
      setAvatarUrl(supabaseProfile.avatar_url);
    }
  }, [supabaseProfile]);

  const pickImage = async () => {
    console.log("pickImage function called");
    try {
      const permissionResult = await requestMediaLibraryPermissionsAsync();
      console.log("Permission result:", permissionResult);

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true, // Request base64 data
      });

      console.log("Image picker result received");

      if (!result.canceled && result.assets[0].base64) {
        setPendingImageBase64(result.assets[0].base64);
        setPendingImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Error in pickImage:", e);
      Alert.alert(
        "Error",
        "An unexpected error occurred while picking the image."
      );
    }
  };

  const uploadAvatar = async (base64: string) => {
    if (!userId) return;
    console.log("Uploading avatar from base64 data...");

    try {
      const fileExt = "jpeg"; // Assuming jpeg for simplicity
      const fileName = `${userId}_${new Date().getTime()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading to Supabase with filePath:", filePath);

      // Use service role client for storage upload to bypass RLS
      const storageClient = supabaseAdmin || supabase;
      const { error: uploadError } = await storageClient.storage
        .from("avatars")
        .upload(filePath, decode(base64), { contentType: "image/jpeg" });

      if (uploadError) {
        throw uploadError;
      }

      console.log("Upload successful, getting public URL...");
      const { data: urlData } = storageClient.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlData) {
        console.log("Public URL obtained:", urlData.publicUrl);
        setAvatarUrl(urlData.publicUrl);
        await updateUserAvatar(userId, urlData.publicUrl);
        console.log("User avatar updated in database.");
      } else {
        throw new Error("Failed to get public URL for avatar.");
      }
    } catch (e: any) {
      console.error("Error during Supabase operation:", e);
      Alert.alert("Error", e.message || "An unexpected error occurred.");
    }
  };

  const saveNewImage = async () => {
    if (pendingImageBase64) {
      await uploadAvatar(pendingImageBase64);
      setPendingImageBase64(null);
      setPendingImageUri(null);
    }
  };

  const cancelImageChange = () => {
    setPendingImageBase64(null);
    setPendingImageUri(null);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(0)}`;
  };

  const displayImageUri = pendingImageUri || avatarUrl;
  const hasPendingImage = !!pendingImageBase64;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Profile</Text>

      {/* Avatar Section */}
      <NeoBrutalCard style={styles.avatarCard}>
        {displayImageUri && (
          <Image source={{ uri: displayImageUri }} style={styles.avatar} />
        )}
        <Text style={styles.displayName}>
          {supabaseProfile?.display_name || "Anonymous Player"}
        </Text>

        {!hasPendingImage ? (
          <NeoBrutalButton
            text="Change Picture"
            onPress={pickImage}
            style={styles.changeImageButton}
          />
        ) : (
          <View style={styles.buttonContainer}>
            <NeoBrutalButton
              text="Save"
              onPress={saveNewImage}
              style={styles.saveButton}
            />
            <NeoBrutalButton
              text="Cancel"
              onPress={cancelImageChange}
              style={styles.cancelButton}
            />
          </View>
        )}
      </NeoBrutalCard>

      {/* Stats Section */}
      <NeoBrutalCard style={styles.statsCard}>
        <Text style={styles.sectionTitle}>My Stats</Text>
        {statsLoading ? (
          <ActivityIndicator size="large" color={appColors.primary} />
        ) : stats ? (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_games}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  stats.total_profit >= 0
                    ? styles.profitPositive
                    : styles.profitNegative,
                ]}>
                {formatCurrency(stats.total_profit)}
              </Text>
              <Text style={styles.statLabel}>Total Profit</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.win_rate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(stats.average_profit_per_game)}
              </Text>
              <Text style={styles.statLabel}>Avg Per Game</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.profitPositive]}>
                {formatCurrency(stats.best_single_game)}
              </Text>
              <Text style={styles.statLabel}>Best Game</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.profitNegative]}>
                {formatCurrency(stats.worst_single_game)}
              </Text>
              <Text style={styles.statLabel}>Worst Game</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noStatsText}>
            No statistics available yet. Play some games!
          </Text>
        )}
      </NeoBrutalCard>

      <NeoBrutalButton
        text="Sign Out"
        onPress={() => signOut()}
        style={styles.signOutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: appColors.text,
    textAlign: "center",
  },
  avatarCard: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: appColors.text,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  changeImageButton: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.text,
    marginBottom: 15,
  },
  statsCard: {
    marginBottom: 20,
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 15,
    padding: 12,
    backgroundColor: appColors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: appColors.text,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: appColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: appColors.lightText,
    textAlign: "center",
  },
  profitPositive: {
    color: appColors.buttonSuccess,
  },
  profitNegative: {
    color: appColors.accentRed,
  },
  noStatsText: {
    fontSize: 16,
    color: appColors.lightText,
    textAlign: "center",
    fontStyle: "italic",
  },
  signOutButton: {
    marginTop: 20,
    alignSelf: "center",
  },
});

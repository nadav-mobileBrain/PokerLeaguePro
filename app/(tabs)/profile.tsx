import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
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

export default function ProfileScreen() {
  const { signOut, userId } = useAuth();
  const { supabaseProfile, ensureUserProfile, updateUserAvatar } =
    useUserStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
        uploadAvatar(result.assets[0].base64);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  signOutButton: {
    backgroundColor: "red",
    marginTop: 20,
  },
});

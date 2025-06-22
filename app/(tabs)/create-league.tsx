import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabaseClient";
import * as FileSystem from "expo-file-system";
import { toByteArray } from "base64-js";
import "react-native-get-random-values";
import { getRandomValues } from "expo-crypto";
import { useUserStore } from "@/store/userStore";
import appColors from "@/constants/colors"; // Import centralized colors

// Helper function to generate a random alphanumeric code
function generateInviteCode(length = 6) {
  console.log("[generateInviteCode] Attempting to generate code...");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "L-"; // Prefix for league codes
  try {
    const randomValues = getRandomValues(new Uint8Array(length));

    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomValues[i] % characters.length);
    }
    console.log("[generateInviteCode] Generated code:", result);
    return result;
  } catch (error) {
    console.error(
      "[generateInviteCode] Error generating random values:",
      error
    );
    console.warn("[generateInviteCode] Falling back to Math.random()");
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
}

export default function CreateLeagueScreen() {
  const router = useRouter();
  const { supabaseProfile, isLoadingProfile, errorProfile } = useUserStore();

  const [leagueName, setLeagueName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultBuyIn, setDefaultBuyIn] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isPublic, setIsPublic] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLeagueId, setNewLeagueId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // --- Image Picker Logic ---
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Aspect ratio for a banner
      quality: 0.8, // Compress image slightly
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      console.log("Image selected:", result.assets[0].uri);
    }
  };
  // ------------------------

  // --- Form Submission Logic ---
  const handleCreateLeague = async () => {
    console.log("[CreateLeague] Submit button pressed!");

    // Check 1: League Name
    if (!leagueName.trim()) {
      Alert.alert("Missing Field", "Please enter a league name.");
      return;
    }
    console.log("[CreateLeague] Passed league name check.");

    // Check 2: Clerk User
    if (!supabaseProfile?.id) {
      Alert.alert(
        "Profile Not Loaded",
        `Your user profile could not be loaded (${
          errorProfile || "Unknown error"
        }). Please try again later.`
      );
      return;
    }
    console.log(
      "[CreateLeague] Passed clerkUser check. User:",
      supabaseProfile.id
    );

    setIsLoading(true);
    setUploading(false);
    console.log("[CreateLeague] Set isLoading to true.");

    let bannerPublicUrl: string | null = null;
    const generatedCode = generateInviteCode();
    const creatorId = supabaseProfile!.id; // We checked for null above

    try {
      // 1. Create League via RPC function
      console.log(
        `[CreateLeague] Calling create_new_league RPC by user ${creatorId}`
      );
      const { data: newLeagueId, error: rpcError } = await supabase.rpc(
        "create_new_league",
        {
          p_creator_id: creatorId,
          p_name: leagueName.trim(),
          p_description: description.trim() || null,
          p_is_public: isPublic,
          p_default_buy_in: defaultBuyIn ? parseFloat(defaultBuyIn) : null,
          p_currency: currency.trim() || "USD",
          p_banner_url: null, // Pass null initially, update later if needed
          p_invite_code: generatedCode,
        }
      );

      if (rpcError) throw rpcError;
      if (!newLeagueId) {
        throw new Error("RPC did not return new league ID.");
      }

      setNewLeagueId(newLeagueId); // Set state if needed elsewhere
      console.log(
        "[CreateLeague] League created via RPC with ID:",
        newLeagueId
      );
      // Note: RPC automatically adds creator as league_admin

      // 2. Upload Banner Image (if selected)
      if (imageUri) {
        console.log("[CreateLeague] Uploading banner image...");
        setUploading(true);
        try {
          const fileExt = imageUri.split(".").pop()?.toLowerCase() ?? "jpg";
          const fileName = `banner.${fileExt}`;
          const filePath = `public/${newLeagueId}/${fileName}`; // Use newLeagueId
          const mimeType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

          // Get pre-signed URL for upload
          const { data, error: signedUrlError } = await supabase.storage
            .from("league-banners")
            .createSignedUploadUrl(filePath);

          if (signedUrlError || !data)
            throw signedUrlError || new Error("Failed to get signed URL");

          // Upload using XMLHttpRequest with direct file data
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  resolve(xhr.response);
                } else {
                  console.error("[CreateLeague] Upload failed:", {
                    status: xhr.status,
                    response: xhr.response,
                    readyState: xhr.readyState,
                  });
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              }
            };
            xhr.onerror = (e) => {
              console.error("[CreateLeague] XHR Error:", e);
              reject(new Error("Network error during upload"));
            };

            xhr.open("PUT", data.signedUrl);
            xhr.setRequestHeader("Content-Type", mimeType);

            // Read file directly
            FileSystem.readAsStringAsync(imageUri, {
              encoding: FileSystem.EncodingType.Base64,
            })
              .then((base64Data) => {
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                xhr.send(bytes.buffer);
              })
              .catch((error) => {
                console.error("[CreateLeague] File read error:", error);
                reject(error);
              });
          });

          // Get public URL
          const { data: urlData } = await supabase.storage
            .from("league-banners")
            .getPublicUrl(filePath);
          bannerPublicUrl = urlData?.publicUrl;
          console.log("[CreateLeague] Banner public URL:", bannerPublicUrl);

          // 3. Update League with Banner URL (if upload succeeded)
          if (bannerPublicUrl) {
            console.log("[CreateLeague] Updating league with banner URL...");
            const { error: updateError } = await supabase
              .from("leagues")
              .update({ banner_url: bannerPublicUrl })
              .eq("id", newLeagueId);

            if (updateError) {
              console.error(
                "[CreateLeague] Error updating league banner URL:",
                updateError
              );
              Alert.alert("Warning", "Failed to link uploaded banner.");
            }
          } else {
            console.warn("[CreateLeague] Could not get public URL for banner.");
          }
        } catch (uploadError: any) {
          console.error("[CreateLeague] Banner Upload Error:", uploadError);
          Alert.alert(
            "Banner Upload Failed",
            uploadError.message || "Could not upload banner."
          );
          // Proceeding without banner update
        } finally {
          setUploading(false);
        }
      } else {
        console.log("[CreateLeague] No banner image selected.");
      }

      // 4. Success
      Alert.alert("Success", "League created successfully!");
      setInviteCode(generatedCode);
      router.back();
    } catch (error: any) {
      console.error("[CreateLeague] Overall error calling RPC:", error);
      Alert.alert("Error", error?.message || "Failed to create league.");
    } finally {
      console.log("[CreateLeague] Entering finally block.");
      setIsLoading(false);
    }
  };
  // -------------------------

  // Add check for profile loading/error before rendering form
  if (isLoadingProfile) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (errorProfile && !supabaseProfile) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Error loading profile: {errorProfile}
        </Text>
        <Text>Cannot create league. Please try logging out and back in.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.kav}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create New League</Text>

        {/* League Name */}
        <Text style={styles.label}>League Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Thursday Night Poker"
          placeholderTextColor={appColors.secondaryText}
          value={leagueName}
          onChangeText={setLeagueName}
          editable={!isLoading}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional: Rules, location, etc."
          placeholderTextColor={appColors.secondaryText}
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!isLoading}
        />

        {/* Default Buy-in */}
        <Text style={styles.label}>Default Buy-in</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional: e.g., 20"
          placeholderTextColor={appColors.secondaryText}
          value={defaultBuyIn}
          onChangeText={setDefaultBuyIn}
          keyboardType="numeric"
          editable={!isLoading}
        />

        {/* Currency */}
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          value={currency}
          onChangeText={setCurrency}
          placeholder="e.g., USD, EUR"
          placeholderTextColor={appColors.secondaryText}
          editable={!isLoading}
        />

        {/* Public/Private */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Public League?</Text>
          <Switch
            trackColor={{
              false: appColors.switchTrackColorFalse,
              true: appColors.switchTrackColorTrue,
            }}
            thumbColor={
              isPublic
                ? appColors.switchTrackColorTrue
                : appColors.switchThumbColor
            }
            ios_backgroundColor={appColors.switchTrackColorFalse}
            onValueChange={setIsPublic}
            value={isPublic}
            disabled={isLoading}
          />
        </View>

        {/* Image Picker */}
        <Text style={styles.label}>League Banner (Optional)</Text>
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={pickImage}
          disabled={isLoading}>
          <Text style={styles.imagePickerButtonText}>Choose Banner Image</Text>
        </TouchableOpacity>
        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.label}>Preview:</Text>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={styles.removeImageButton}
              disabled={isLoading}>
              <Text style={styles.removeImageButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || !leagueName.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={handleCreateLeague}
          disabled={isLoading || !leagueName.trim()}>
          {isLoading || uploading ? (
            <ActivityIndicator color={appColors.lightText} />
          ) : (
            <Text style={styles.submitButtonText}>Create League</Text>
          )}
        </TouchableOpacity>

        {/* Removed any extra UI elements like date/time picker, frequency, success/error sections */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 50, // Ensure space at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: appColors.lightText,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
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
    marginBottom: 15,
  },
  textArea: {
    height: 100, // Adjust height for multiline
    textAlignVertical: "top", // Align text to top
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: appColors.lightText,
  },
  imagePickerButton: {
    backgroundColor: appColors.imagePickerButtonBG,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: appColors.imagePickerButtonText,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: appColors.removeImageButtonBG,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  removeImageButtonText: {
    fontSize: 14,
    color: appColors.removeImageButtonText,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: appColors.buttonGreen,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: appColors.secondaryText,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: appColors.lightText,
  },
  errorText: {
    color: appColors.accentRed,
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

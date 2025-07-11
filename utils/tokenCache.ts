import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

async function saveToken(key: string, value: string) {
  try {
    console.log(`[tokenCache] Attempting to save token with key: ${key}`);
    // Add check for value length or content if needed
    // console.log(`[tokenCache] Value to save (first 10 chars): ${value.substring(0, 10)}...`);
    await SecureStore.setItemAsync(key, value);
    console.log(`[tokenCache] Successfully saved token with key: ${key}`);
  } catch (err) {
    console.error("[tokenCache] Failed to save token", { key, error: err });
  }
}

async function getToken(key: string) {
  try {
    console.log(`[tokenCache] Attempting to get token with key: ${key}`);
    const value = await SecureStore.getItemAsync(key);
    console.log(`[tokenCache] Got token for key ${key}?`, !!value);
    return value;
  } catch (err) {
    console.error("[tokenCache] Failed to get token", { key, error: err });
    return null;
  }
}

async function deleteToken(key: string) {
  try {
    console.log(`[tokenCache] Attempting to delete token with key: ${key}`);
    await SecureStore.deleteItemAsync(key);
    console.log(`[tokenCache] Successfully deleted token with key: ${key}`);
  } catch (err) {
    console.error("[tokenCache] Failed to delete token", { key, error: err });
  }
}

async function clearAllTokens() {
  try {
    console.log("[tokenCache] Clearing all Clerk tokens...");
    await SecureStore.deleteItemAsync("__clerk_client_jwt");
    await SecureStore.deleteItemAsync("__clerk_refresh_token");
    await SecureStore.deleteItemAsync("__clerk_client_uat");
    await SecureStore.deleteItemAsync("__clerk_session_token");
    console.log("[tokenCache] All tokens cleared successfully");
  } catch (err) {
    console.error("[tokenCache] Failed to clear tokens", err);
  }
}

export const tokenCache = {
  getToken,
  saveToken,
  deleteToken,
  clearAllTokens,
};

// SecureStore is not supported on the web
// https://github.com/expo/expo/issues/7744#issuecomment-611093485
// Use an alternative storage solution like localStorage
export const webTokenCache = {
  async getToken(key: string) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error("Failed to get token from localStorage", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error("Failed to save token to localStorage", err);
    }
  },
  async deleteToken(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Failed to delete token from localStorage", err);
    }
  },
  async clearAllTokens() {
    try {
      console.log("[webTokenCache] Clearing all Clerk tokens...");
      localStorage.removeItem("__clerk_client_jwt");
      localStorage.removeItem("__clerk_refresh_token");
      localStorage.removeItem("__clerk_client_uat");
      localStorage.removeItem("__clerk_session_token");
      console.log("[webTokenCache] All tokens cleared successfully");
    } catch (err) {
      console.error("Failed to clear tokens from localStorage", err);
    }
  },
};

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

export const tokenCache = {
  getToken,
  saveToken,
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
};

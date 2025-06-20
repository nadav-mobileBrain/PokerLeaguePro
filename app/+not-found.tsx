import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import React from "react";
import appColors from "@/constants/colors"; // Import centralized colors

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen Not Found</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: appColors.background, // Dark background
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: appColors.lightText, // Light text
    marginBottom: 20, // Add margin
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: appColors.buttonGreen, // Use button green for link
    textDecorationLine: "underline", // Add underline
  },
});

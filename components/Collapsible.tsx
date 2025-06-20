import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import appColors from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";

  const iconColor = appColors.secondaryText;
  const titleColor = appColors.text;
  const borderColor = appColors.inputBorder;

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward-outline"}
          size={18}
          color={iconColor}
        />
        <Text style={[styles.headingText, { color: titleColor }]}>{title}</Text>
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={[styles.content, { borderColor: borderColor }]}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headingText: {
    flex: 1,
    fontWeight: "600",
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
    padding: 10,
    borderLeftWidth: 1,
  },
});

import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import appColors from "@/constants/colors"; // Import centralized colors

// You can explore using dripping fonts for icon components, default is FontAwesome.
// Learn more about FontAwesome icons: https://docs.expo.dev/guides/icons/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Use imported colors directly
  const tabBarActiveTintColor = appColors.tabBarActiveTint;
  const tabBarInactiveTintColor = appColors.tabBarInactiveTint;
  const tabBarBackgroundColor = appColors.tabBarBackground;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        // Set headerShown based on typical mobile behavior
        headerShown: true,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopColor: appColors.border,
        },
        headerStyle: {
          backgroundColor: tabBarBackgroundColor,
        },
        headerTintColor: appColors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          // Example headerRight - remove if not needed or update color source
          headerRight: () => (
            <Link href="/modals/join-by-code" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus-circle" // Icon for joining
                    size={25}
                    color={appColors.primary} // Use primary color from imported theme
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          title: "My Leagues",
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-league"
        options={{
          title: "Create League",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-square" color={color} />
          ),
          // Set headerShown explicitly if needed (default is true from screenOptions)
          // headerShown: true,
        }}
      />
      {/* Hidden league detail screen */}
      <Tabs.Screen
        name="league/[leagueId]"
        options={{
          href: null,
          title: "League Details",
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const ICONS = {
  profile: "person-circle-outline",
  cashflow: "wallet-outline",
  paysights: "stats-chart-outline",
} as const;

// Reusable Animated Icon Component
function AnimatedIcon({
  name,
  focused,
  size,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
} & TabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: focused ? 1.3 : 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const renderIcon = (key: keyof typeof ICONS) => {
    return ({ focused, color, size }: TabIconProps) => (
      <AnimatedIcon
        name={ICONS[key]}
        focused={focused}
        color={color}
        size={size}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
  height: 60,
  backgroundColor: "#fff",
}
,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: renderIcon("profile"),
        }}
      />

      <Tabs.Screen
        name="cashflow"
        options={{
          title: "Cash Flow",
          tabBarIcon: renderIcon("cashflow"),
        }}
      />

      <Tabs.Screen
        name="paysights"
        options={{
          title: "Paysights",
          tabBarIcon: renderIcon("paysights"),
        }}
      />
    </Tabs>
  );
}

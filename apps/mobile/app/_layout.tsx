import { AuthProvider } from "../src/context/AuthContext";
import { Tabs } from "expo-router";
import { ShoppingBag, ShoppingCart, Package, User } from "lucide-react-native";

export default function Layout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontWeight: "800", color: "#111827" },
          headerTintColor: "#c11d17",
          tabBarActiveTintColor: "#c11d17",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#e5e7eb",
            paddingBottom: 6,
            paddingTop: 4,
            height: 62,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Shop",
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
            headerTitle: "Datamak NexCart",
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}

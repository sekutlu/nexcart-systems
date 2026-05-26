import { SafeAreaView, StyleSheet, Text } from "react-native";

export function OrdersScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.muted}>Order history will read from the shared `/orders` API.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f8fa", padding: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  muted: { color: "#657080", marginTop: 8 }
});

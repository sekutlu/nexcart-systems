import { SafeAreaView, StyleSheet, Text } from "react-native";

export function CartScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Cart</Text>
      <Text style={styles.muted}>Connect this screen to `/cart` with a stored JWT.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f8fa", padding: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  muted: { color: "#657080", marginTop: 8 }
});

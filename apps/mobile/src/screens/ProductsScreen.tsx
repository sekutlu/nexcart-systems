import { Product } from "@nexcart/shared";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>NexCart</Text>
        <View style={styles.links}>
          <Link href="/login">Login</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f8fa", padding: 16 },
  header: { gap: 8, marginBottom: 16 },
  title: { color: "#115e59", fontSize: 28, fontWeight: "700" },
  links: { flexDirection: "row", gap: 16 },
  card: { backgroundColor: "#fff", borderRadius: 8, marginBottom: 12, padding: 16 },
  name: { fontSize: 18, fontWeight: "700" },
  description: { color: "#657080", marginVertical: 6 },
  price: { fontWeight: "700" }
});

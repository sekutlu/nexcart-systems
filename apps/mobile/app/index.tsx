import { API_URL, useAuth } from "../src/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, RefreshControl,
} from "react-native";
import { ShoppingCart, Search, Check, Package } from "lucide-react-native";

type Product = {
  id: string; name: string; description: string;
  price: number; stock: number; category: string; imageUrl: string | null;
};

const CATEGORIES = ["All", "Computers", "Networking", "ICT Products", "Web Hosting", "Accessories"];
const ACCENT = "#c11d17";
const TEAL   = "#007c89";

export default function ProductsScreen() {
  const { user } = useAuth();
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [cart, setCart]             = useState<string[]>([]);
  const [adding, setAdding]         = useState<string | null>(null);

  const load = useCallback(async (q = search, cat = category) => {
    const params = new URLSearchParams();
    if (q)              params.set("search",   q);
    if (cat !== "All")  params.set("category", cat);
    try {
      const res  = await fetch(`${API_URL}/products?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    load(text, category);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    load(search, cat);
  };

  const addToCart = async (product: Product) => {
    if (cart.includes(product.id) || adding) return;
    setAdding(product.id);
    if (user?.token) {
      try {
        await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ productId: product.id, quantity: 1, name: product.name, price: product.price, stock: product.stock }),
        });
      } catch {}
    }
    setCart(prev => [...prev, product.id]);
    setAdding(null);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const inCart = cart.includes(item.id);
    const busy   = adding === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardImg}>
          <Package size={40} color={ACCENT} strokeWidth={1.2} />
          {item.stock <= 5 && item.stock > 0 && (
            <View style={[styles.badge, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.badgeText}>Low Stock</Text>
            </View>
          )}
          {item.stock === 0 && (
            <View style={[styles.badge, { backgroundColor: "#9ca3af" }]}>
              <Text style={styles.badgeText}>Out of Stock</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          {item.category ? <Text style={styles.category}>{item.category.toUpperCase()}</Text> : null}
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.price}>M {item.price.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, inCart && styles.addBtnDone, item.stock === 0 && styles.addBtnDisabled]}
          onPress={() => addToCart(item)}
          disabled={inCart || busy || item.stock === 0}
          activeOpacity={0.8}
        >
          {busy
            ? <ActivityIndicator size="small" color="#fff" />
            : inCart
            ? <><Check size={14} color="#fff" strokeWidth={2.5} /><Text style={styles.addBtnText}> Added</Text></>
            : <><ShoppingCart size={14} color="#fff" strokeWidth={2} /><Text style={styles.addBtnText}> Add to Cart</Text></>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 28, zIndex: 1 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products…"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, category === cat && styles.pillActive]}
            onPress={() => handleCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={ACCENT} /></View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Package size={48} color="#d1d5db" strokeWidth={1} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={i => i.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: "#f4f6f8" },
  searchRow:       { margin: 16, marginBottom: 8, position: "relative" },
  searchInput:     { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1.5, borderColor: "#e5e7eb", color: "#111827", fontSize: 14, paddingHorizontal: 16, paddingLeft: 40, paddingVertical: 11 },
  pillRow:         { marginBottom: 8, flexGrow: 0 },
  pill:            { backgroundColor: "#fff", borderRadius: 999, borderWidth: 1.5, borderColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 7 },
  pillActive:      { backgroundColor: ACCENT, borderColor: ACCENT },
  pillText:        { color: "#6b7280", fontSize: 13, fontWeight: "600" },
  pillTextActive:  { color: "#fff" },
  center:          { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText:       { color: "#9ca3af", fontSize: 16, fontWeight: "600" },
  card:            { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardImg:         { alignItems: "center", backgroundColor: "#f9fafb", height: 130, justifyContent: "center", position: "relative" },
  badge:           { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, position: "absolute", top: 10, left: 10 },
  badgeText:       { color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardBody:        { padding: 14, gap: 4 },
  category:        { color: ACCENT, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  name:            { color: "#111827", fontSize: 15, fontWeight: "700", lineHeight: 20 },
  desc:            { color: "#6b7280", fontSize: 12, lineHeight: 17 },
  price:           { color: "#111827", fontSize: 18, fontWeight: "900", marginTop: 4 },
  addBtn:          { alignItems: "center", backgroundColor: ACCENT, flexDirection: "row", justifyContent: "center", margin: 14, marginTop: 0, borderRadius: 8, paddingVertical: 11, gap: 4 },
  addBtnDone:      { backgroundColor: TEAL },
  addBtnDisabled:  { backgroundColor: "#d1d5db" },
  addBtnText:      { color: "#fff", fontSize: 13, fontWeight: "700" },
});

import { API_URL, useAuth } from "../src/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, SafeAreaView, StyleSheet,
  Text, TouchableOpacity, View, Alert,
} from "react-native";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from "lucide-react-native";
import { router } from "expo-router";

type CartItem = {
  id: string; productId: string; quantity: number;
  product: { id: string; name: string; price: number; stock: number; category: string; imageUrl: string | null };
};

const ACCENT = "#c11d17";
const TEAL   = "#007c89";

export default function CartScreen() {
  const { user } = useAuth();
  const [items, setItems]       = useState<CartItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const authH = { Authorization: `Bearer ${user?.token}`, "Content-Type": "application/json" };

  const load = useCallback(async () => {
    if (!user?.token) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API_URL}/cart`, { headers: authH });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [user?.token]);

  useEffect(() => { load(); }, [load]);

  const updateQty = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(productId);
    await fetch(`${API_URL}/cart`, { method: "PATCH", headers: authH, body: JSON.stringify({ productId, quantity }) });
    await load();
    setUpdating(null);
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    await fetch(`${API_URL}/cart`, { method: "DELETE", headers: authH, body: JSON.stringify({ productId }) });
    setItems(prev => prev.filter(i => i.productId !== productId));
    setUpdating(null);
  };

  const checkout = async () => {
    if (!user?.token) { router.push("/login"); return; }
    try {
      const res  = await fetch(`${API_URL}/orders`, { method: "POST", headers: authH });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Checkout Failed", data.error ?? "Please try again."); return; }
      Alert.alert("Order Placed!", `Order #${data.id?.slice(-8).toUpperCase() ?? "DEMO"} created.\nTotal: M ${data.total?.toLocaleString() ?? 0}`, [
        { text: "View Orders", onPress: () => router.push("/orders") },
        { text: "OK" },
      ]);
      setItems([]);
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const subtotal  = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ShoppingCart size={52} color="#d1d5db" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Sign in to view your cart</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/login")} activeOpacity={0.85}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <SafeAreaView style={styles.screen}><View style={styles.center}><ActivityIndicator size="large" color={ACCENT} /></View></SafeAreaView>;
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ShoppingCart size={52} color="#d1d5db" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse products and add items to get started.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/")} activeOpacity={0.85}>
            <Text style={styles.btnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.header}>{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</Text>}
        renderItem={({ item }) => {
          const busy = updating === item.productId;
          return (
            <View style={[styles.card, busy && { opacity: 0.6 }]}>
              <View style={styles.cardImg}>
                <Package size={28} color={ACCENT} strokeWidth={1.2} />
              </View>
              <View style={styles.cardInfo}>
                {item.product.category ? <Text style={styles.cat}>{item.product.category.toUpperCase()}</Text> : null}
                <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.unitPrice}>M {item.product.price.toLocaleString()} each</Text>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.productId, item.quantity - 1)} disabled={busy || item.quantity <= 1}>
                  <Minus size={12} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.productId, item.quantity + 1)} disabled={busy || item.quantity >= item.product.stock}>
                  <Plus size={12} color="#374151" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.productId)} disabled={busy}>
                  <Trash2 size={14} color={ACCENT} />
                </TouchableOpacity>
              </View>
              <Text style={styles.lineTotal}>M {(item.product.price * item.quantity).toLocaleString()}</Text>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
              <Text style={styles.summaryTotal}>M {subtotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout} activeOpacity={0.85}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <ArrowRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: "#f4f6f8" },
  center:       { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  emptyTitle:   { color: "#374151", fontSize: 18, fontWeight: "700" },
  emptySub:     { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  btn:          { backgroundColor: ACCENT, borderRadius: 10, marginTop: 8, paddingHorizontal: 28, paddingVertical: 12 },
  btnText:      { color: "#fff", fontSize: 14, fontWeight: "700" },
  header:       { color: "#6b7280", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  card:         { backgroundColor: "#fff", borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  cardImg:      { alignItems: "center", backgroundColor: "#f9fafb", borderRadius: 8, height: 52, justifyContent: "center", width: 52 },
  cardInfo:     { flex: 1, gap: 2 },
  cat:          { color: ACCENT, fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
  name:         { color: "#111827", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  unitPrice:    { color: "#9ca3af", fontSize: 12 },
  controls:     { alignItems: "center", flexDirection: "row", gap: 6 },
  qtyBtn:       { alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 6, height: 28, justifyContent: "center", width: 28 },
  qty:          { color: "#111827", fontSize: 14, fontWeight: "800", minWidth: 20, textAlign: "center" },
  removeBtn:    { alignItems: "center", backgroundColor: "#fee2e2", borderRadius: 6, height: 28, justifyContent: "center", width: 28 },
  lineTotal:    { color: "#111827", fontSize: 14, fontWeight: "900", minWidth: 70, textAlign: "right" },
  summary:      { backgroundColor: "#fff", borderRadius: 14, marginTop: 8, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  summaryTotal: { color: ACCENT, fontSize: 20, fontWeight: "900" },
  checkoutBtn:  { alignItems: "center", backgroundColor: ACCENT, borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 14 },
  checkoutText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});

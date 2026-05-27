import { API_URL, useAuth } from "../src/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, RefreshControl, SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Package, CheckCircle2, Clock, Truck, CreditCard, XCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import { router } from "expo-router";

type OrderItem = { id: string; quantity: number; price: number; product: { name: string } };
type Order     = { id: string; status: string; total: number; createdAt: string; items: OrderItem[] };

const ACCENT = "#c11d17";
const TEAL   = "#007c89";

const STATUS: Record<string, { label: string; color: string; Icon: any }> = {
  PENDING:   { label: "Pending",   color: "#9ca3af", Icon: Clock        },
  PAID:      { label: "Paid",      color: "#3b82f6", Icon: CreditCard   },
  SHIPPED:   { label: "Shipped",   color: "#f59e0b", Icon: Truck        },
  DELIVERED: { label: "Delivered", color: TEAL,      Icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: ACCENT,    Icon: XCircle      },
};

const STEPS = ["Order Placed", "Payment", "Shipped", "Delivered"];
const STEP_STATUS: Record<string, number> = { PENDING: 0, PAID: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 };

function TrackingBar({ status }: { status: string }) {
  const step = STEP_STATUS[status] ?? 0;
  if (status === "CANCELLED") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
        <XCircle size={14} color={ACCENT} />
        <Text style={{ color: ACCENT, fontSize: 12, fontWeight: "700" }}>Order Cancelled</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
      {STEPS.map((label, i) => {
        const done = i <= step;
        return (
          <View key={label} style={{ alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <View style={{ alignItems: "center", flexDirection: "row", flex: 1 }}>
              <View style={{ alignItems: "center", gap: 4 }}>
                <View style={{ alignItems: "center", backgroundColor: done ? TEAL : "#e5e7eb", borderRadius: 12, height: 24, justifyContent: "center", width: 24 }}>
                  {done ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} /> : <View style={{ backgroundColor: "#d1d5db", borderRadius: 4, height: 8, width: 8 }} />}
                </View>
                <Text style={{ color: done ? "#111827" : "#9ca3af", fontSize: 9, fontWeight: done ? "700" : "500", textAlign: "center", width: 52 }}>{label}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={{ backgroundColor: i < step ? TEAL : "#e5e7eb", flex: 1, height: 2, marginBottom: 14 }} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS[order.status] ?? STATUS.PENDING;
  const { Icon } = cfg;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.8}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.color + "18", borderColor: cfg.color + "44" }]}>
              <Icon size={11} color={cfg.color} strokeWidth={2.5} />
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={styles.orderTotal}>M {order.total.toLocaleString()}</Text>
          {expanded ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <TrackingBar status={order.status} />
          <View style={styles.divider} />
          {order.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemIcon}><Package size={16} color={ACCENT} strokeWidth={1.2} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity} × M {item.price.toLocaleString()}</Text>
              </View>
              <Text style={styles.itemTotal}>M {(item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.divider, { marginTop: 4 }]} />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>Total:</Text>
            <Text style={{ color: ACCENT, fontSize: 18, fontWeight: "900" }}>M {order.total.toLocaleString()}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const authH = { Authorization: `Bearer ${user?.token}` };

  const load = useCallback(async () => {
    if (!user?.token) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API_URL}/orders`, { headers: authH });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user?.token]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Package size={52} color="#d1d5db" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
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

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Package size={52} color="#d1d5db" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Add items to your cart and checkout to place your first order.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.push("/")} activeOpacity={0.85}>
              <Text style={styles.btnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: "#f4f6f8" },
  center:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, minHeight: 300 },
  emptyTitle:  { color: "#374151", fontSize: 18, fontWeight: "700" },
  emptySub:    { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  btn:         { backgroundColor: ACCENT, borderRadius: 10, marginTop: 8, paddingHorizontal: 28, paddingVertical: 12 },
  btnText:     { color: "#fff", fontSize: 14, fontWeight: "700" },
  card:        { backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader:  { flexDirection: "row", justifyContent: "space-between", padding: 16 },
  orderId:     { backgroundColor: "#f3f4f6", borderRadius: 6, color: "#374151", fontFamily: "monospace", fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2 },
  statusBadge: { alignItems: "center", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:  { fontSize: 11, fontWeight: "700" },
  orderDate:   { color: "#9ca3af", fontSize: 12 },
  orderTotal:  { color: ACCENT, fontSize: 16, fontWeight: "900" },
  cardBody:    { borderTopColor: "#f3f4f6", borderTopWidth: 1, padding: 16, gap: 10 },
  divider:     { backgroundColor: "#f3f4f6", height: 1, marginVertical: 4 },
  itemRow:     { alignItems: "center", flexDirection: "row", gap: 10 },
  itemIcon:    { alignItems: "center", backgroundColor: "#f9fafb", borderRadius: 8, height: 36, justifyContent: "center", width: 36 },
  itemName:    { color: "#111827", fontSize: 13, fontWeight: "600" },
  itemQty:     { color: "#9ca3af", fontSize: 12 },
  itemTotal:   { color: "#111827", fontSize: 13, fontWeight: "800" },
});

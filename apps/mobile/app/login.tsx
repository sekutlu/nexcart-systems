import { useAuth } from "../src/context/AuthContext";
import { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { User, LogOut, Eye, EyeOff } from "lucide-react-native";

const ACCENT = "#c11d17";

export default function LoginScreen() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode]       = useState<"login" | "register">("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        setSuccess("Signed in successfully!");
      } else {
        await register(name, email, password);
        setSuccess("Account created! Welcome to Datamak NexCart.");
      }
      setEmail(""); setPassword(""); setName("");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Logged-in view
  if (user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={[styles.roleBadge, user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? styles.roleBadgeAdmin : {}]}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Account Details</Text>
          {[["User ID", user.id.slice(0, 16) + "…"], ["Email", user.email], ["Role", user.role]].map(([label, val]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoVal}>{val}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={16} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logo}><Text style={styles.logoText}>D</Text></View>
            <Text style={styles.logoTitle}>Datamak <Text style={{ color: ACCENT }}>NexCart</Text></Text>
            <Text style={styles.logoSub}>{mode === "login" ? "Sign in to your account" : "Create a new account"}</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity style={[styles.toggleBtn, mode === "login" && styles.toggleActive]} onPress={() => { setMode("login"); setError(""); setSuccess(""); }}>
              <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, mode === "register" && styles.toggleActive]} onPress={() => { setMode("register"); setError(""); setSuccess(""); }}>
              <Text style={[styles.toggleText, mode === "register" && styles.toggleTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {mode === "register" && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} autoCapitalize="words" />
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={{ position: "relative" }}>
                <TextInput style={[styles.input, { paddingRight: 48 }]} placeholder="••••••••" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry={!showPw} />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            {error   ? <View style={styles.alertError}><Text style={styles.alertErrorText}>{error}</Text></View>   : null}
            {success ? <View style={styles.alertSuccess}><Text style={styles.alertSuccessText}>{success}</Text></View> : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><User size={16} color="#fff" /><Text style={styles.submitText}>{mode === "login" ? "Sign In" : "Create Account"}</Text></>}
            </TouchableOpacity>

            <Text style={styles.hint}>
              Demo admin: <Text style={{ color: ACCENT, fontWeight: "700" }}>admin@nexcart.com</Text> / <Text style={{ color: ACCENT, fontWeight: "700" }}>Admin@12345</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#f4f6f8" },
  scroll:           { padding: 24, paddingTop: 32 },
  logoWrap:         { alignItems: "center", marginBottom: 28 },
  logo:             { alignItems: "center", backgroundColor: ACCENT, borderRadius: 14, height: 56, justifyContent: "center", marginBottom: 12, width: 56 },
  logoText:         { color: "#fff", fontSize: 24, fontWeight: "900" },
  logoTitle:        { color: "#111827", fontSize: 22, fontWeight: "900" },
  logoSub:          { color: "#6b7280", fontSize: 14, marginTop: 4 },
  toggle:           { backgroundColor: "#e5e7eb", borderRadius: 10, flexDirection: "row", marginBottom: 24, padding: 4 },
  toggleBtn:        { borderRadius: 8, flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleActive:     { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:       { color: "#6b7280", fontSize: 14, fontWeight: "600" },
  toggleTextActive: { color: "#111827", fontWeight: "800" },
  form:             { gap: 16 },
  field:            { gap: 6 },
  label:            { color: "#374151", fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  input:            { backgroundColor: "#fff", borderColor: "#e5e7eb", borderRadius: 10, borderWidth: 1.5, color: "#111827", fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  eyeBtn:           { alignItems: "center", bottom: 0, justifyContent: "center", position: "absolute", right: 14, top: 0 },
  alertError:       { backgroundColor: "#fee2e2", borderColor: "#fca5a5", borderRadius: 8, borderWidth: 1, padding: 12 },
  alertErrorText:   { color: "#991b1b", fontSize: 13, fontWeight: "500" },
  alertSuccess:     { backgroundColor: "#d1fae5", borderColor: "#6ee7b7", borderRadius: 8, borderWidth: 1, padding: 12 },
  alertSuccessText: { color: "#065f46", fontSize: 13, fontWeight: "500" },
  submitBtn:        { alignItems: "center", backgroundColor: ACCENT, borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 14 },
  submitText:       { color: "#fff", fontSize: 15, fontWeight: "800" },
  hint:             { color: "#9ca3af", fontSize: 12, textAlign: "center" },
  // Profile
  profileCard:      { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, margin: 20, padding: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar:           { alignItems: "center", backgroundColor: ACCENT, borderRadius: 40, height: 72, justifyContent: "center", marginBottom: 12, width: 72 },
  avatarText:       { color: "#fff", fontSize: 30, fontWeight: "900" },
  profileName:      { color: "#111827", fontSize: 20, fontWeight: "800" },
  profileEmail:     { color: "#6b7280", fontSize: 14, marginTop: 4 },
  roleBadge:        { backgroundColor: "#e0f2fe", borderRadius: 20, marginTop: 10, paddingHorizontal: 14, paddingVertical: 4 },
  roleBadgeAdmin:   { backgroundColor: "#fee2e2" },
  roleText:         { color: "#0369a1", fontSize: 12, fontWeight: "700" },
  infoCard:         { backgroundColor: "#fff", borderRadius: 12, marginHorizontal: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  infoTitle:        { color: "#111827", fontSize: 15, fontWeight: "800", marginBottom: 14 },
  infoRow:          { borderTopColor: "#f3f4f6", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  infoLabel:        { color: "#6b7280", fontSize: 13 },
  infoVal:          { color: "#111827", fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  logoutBtn:        { alignItems: "center", backgroundColor: ACCENT, borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", margin: 20, paddingVertical: 14 },
  logoutText:       { color: "#fff", fontSize: 15, fontWeight: "800" },
});

import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { api } from "../api/client";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn() {
    try {
      const result = await api.login(email, password);
      setMessage(`Signed in as ${result.user.name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <TouchableOpacity onPress={signIn} style={styles.button}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.muted}>{message}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f8fa", gap: 12, padding: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12 },
  button: { alignItems: "center", backgroundColor: "#0f766e", borderRadius: 8, padding: 12 },
  buttonText: { color: "#fff", fontWeight: "700" },
  muted: { color: "#657080" }
});

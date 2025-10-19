import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";

const NewPasswordScreen = () => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated successfully!", [
        { text: "OK", onPress: () => router.replace("./AuthScreen") },
      ]);
    }
  };

  return (
    <LinearGradient
      colors={["#1c1c1c", "#2e2e2e", "#3a3a3a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.9}
          style={{ width: "100%" }}
        >
          <LinearGradient
            colors={["#FFD700", "#32CD32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  card: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "rgba(30,30,30,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#FFD700",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#2e2e2e",
    borderColor: "#444",
    borderWidth: 1,
    fontSize: 16,
    color: "#fff",
  },
  mainButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  mainButtonText: {
    color: "#1c1c1c",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default NewPasswordScreen;

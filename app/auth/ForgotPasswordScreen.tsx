import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [censoredEmail, setCensoredEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email.trim()) return;

    // Censor email
    const [user, domain] = email.split("@");
    const censored =
      user.slice(0, 2) + "****" + user.slice(-2) + "@" + domain;

    setCensoredEmail(censored);
    setOtpSent(true);

    // Supabase reset flow
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: "https://your-app.com/reset",
    });
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    // Simulated OTP verification
    router.push("./NewPassword");
  };

  return (
    <LinearGradient
      colors={["#1c1c1c", "#2e2e2e", "#3a3a3a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Card wrapper */}
        <View style={styles.card}>
          {/* Back arrow */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={26} color="#FFD700" />
          </TouchableOpacity>

          {!otpSent ? (
            <>
              <Text style={styles.title}>Forgot Password</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TouchableOpacity
                onPress={handleSendCode}
                activeOpacity={0.9}
                style={{ width: "100%" }}
              >
                <LinearGradient
                  colors={["#FFD700", "#32CD32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainButton}
                >
                  <Text style={styles.mainButtonText}>Send Code</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                A confirmation code was sent to {censoredEmail}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter OTP code"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity
                onPress={handleVerifyOtp}
                activeOpacity={0.9}
                style={{ width: "100%" }}
              >
                <LinearGradient
                  colors={["#FFD700", "#32CD32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainButton}
                >
                  <Text style={styles.mainButtonText}>Verify</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#2e2e2e",
    borderColor: "#444",
    borderWidth: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto_400Regular",
  },
  mainButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  mainButtonText: {
    color: "#1c1c1c",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
});

export default ForgotPasswordScreen;

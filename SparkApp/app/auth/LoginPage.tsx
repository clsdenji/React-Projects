import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";

const GOLD = "#FFDE59";
const GREEN = "#7ED957";

const AuthScreen = () => {
  const router = useRouter();

  const [location, setLocation] = useState<any | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [passwordError, setPasswordError] = useState("");
  const [rePasswordError, setRePasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const heartbeat = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({ Poppins_700Bold, Roboto_400Regular });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeat, {
          toValue: 1.25,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeat, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heartbeat]);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permission to access location was denied.");
          Alert.alert(
            "Location Permission",
            "You need to enable location permission to continue."
          );
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (error) {
        setLocationError("Failed to get location.");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateEmail = (value: string) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(value.trim()) ? "" : "Please enter a valid email address.");
  };

  const validatePassword = (value: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    setPasswordError(
      regex.test(value)
        ? ""
        : "Password must be 8+ chars, include upper, lower, number & special char."
    );
    setPassword(value);
  };

  const validateRePassword = (value: string) => {
    setRePassword(value);
    setRePasswordError(value === password ? "" : "Passwords do not match.");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName("");
    setEmail("");
    setPassword("");
    setRePassword("");
    setPasswordError("");
    setRePasswordError("");
    setEmailError("");
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && (!name.trim() || !rePassword))) {
      alert("Please fill all required fields.");
      return;
    }

    if (emailError || passwordError || rePasswordError) {
      alert("Please fix the errors before proceeding.");
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        alert("Login failed: " + error.message);
      } else {
        router.replace("../map");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        alert("Sign-up failed: " + error.message);
      } else {
        const userId = data.user?.id;

        const { error: insertError } = await supabase.from("users").insert([
          {
            user_id: userId,
            full_name: sanitizedName,
            email: sanitizedEmail,
          },
        ]);

        if (insertError) {
          alert("Error saving user details: " + insertError.message);
        } else {
          Alert.alert(
            "Account Created",
            "Your account has been successfully created. Please log in.",
            [{ text: "OK", onPress: () => setIsLogin(true) }]
          );
        }
      }
    }
  };

  if (!fontsLoaded || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Text style={[styles.loadingBolt, { transform: [{ scale: heartbeat }] }]}>
          ⚡
        </Animated.Text>
        <Text style={styles.loadingText}>Requesting location permission...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "red", marginBottom: 20 }}>{locationError}</Text>
        <TouchableOpacity onPress={() => setLocationError(null)}>
          <Text style={{ color: GOLD, textDecorationLine: "underline" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#000000", "#0d0d0d", "#1a1a1a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          <View style={{ alignItems: "center", marginBottom: 25 }}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.sparkTitle}>Spark</Text>
          </View>

          {!isLogin && (
            <TextInput
              style={[styles.input, focusedInput === "name" && styles.inputFocused]}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Full Name"
              placeholderTextColor="#888"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={[styles.input, focusedInput === "email" && styles.inputFocused]}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={validateEmail}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput
            style={[styles.input, focusedInput === "password" && styles.inputFocused]}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={validatePassword}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {!isLogin && (
            <>
              <TextInput
                style={[styles.input, focusedInput === "repassword" && styles.inputFocused]}
                onFocus={() => setFocusedInput("repassword")}
                onBlur={() => setFocusedInput(null)}
                placeholder="Re-enter Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={rePassword}
                onChangeText={validateRePassword}
              />
              {rePasswordError ? <Text style={styles.errorText}>{rePasswordError}</Text> : null}
            </>
          )}

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9} style={{ width: "100%" }}>
            <LinearGradient colors={[GOLD, GREEN]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mainButton}>
              <Text style={styles.mainButtonText}>{isLogin ? "Log in" : "Sign Up"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>
              {isLogin ? "Create new account" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={() => router.push("./ForgotPasswordScreen")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", backgroundColor: "#000" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },

  card: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 35, // more rounded look
    backgroundColor: "rgba(20,20,20,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(126, 217, 87, 0.3)",
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    alignItems: "center",
  },

  welcomeText: {
    fontSize: 22,
    color: GOLD,
    fontFamily: "Poppins_700Bold",
    textShadowColor: "rgba(255, 222, 89, 0.45)",
    textShadowRadius: 10,
    letterSpacing: 1,
    marginBottom: -4,
  },
  sparkTitle: {
    fontSize: 40,
    color: GREEN,
    fontFamily: "Poppins_700Bold",
    textShadowColor: "rgba(126, 217, 87, 0.5)",
    textShadowRadius: 15,
    letterSpacing: 2,
  },

  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto_400Regular",
  },
  inputFocused: {
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  mainButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    shadowColor: GOLD,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  mainButtonText: {
    color: "#0b0b0b",
    fontWeight: "700",
    fontSize: 20,
    letterSpacing: 1.2,
    fontFamily: "Poppins_700Bold",
  },
  outlineButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  outlineButtonText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },

  forgotText: {
    color: GOLD,
    marginTop: 10,
    fontSize: 15,
    textDecorationLine: "underline",
  },

  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    alignSelf: "flex-start",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 15,
    color: GOLD,
    fontSize: 16,
  },
  loadingBolt: {
    fontSize: 60,
    color: GOLD,
    textShadowColor: "rgba(255, 222, 89, 0.6)",
    textShadowRadius: 25,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default AuthScreen;

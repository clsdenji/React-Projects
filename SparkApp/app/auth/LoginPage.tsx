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
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";

const AuthScreen = () => {
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [fontsLoaded] = useFonts({ Poppins_700Bold, Roboto_400Regular });

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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        alert("Login failed: " + error.message);
      } else {
        router.replace("../map"); // Redirect to map after login
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
          // Show success alert and switch to login mode
          Alert.alert(
            "Account Created",
            "Your account has been successfully created. Please log in.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Switch to login mode and reset form
                  setIsLogin(true);
                  setName("");
                  setEmail("");
                  setPassword("");
                  setRePassword("");
                  setPasswordError("");
                  setRePasswordError("");
                  setEmailError("");
                },
              },
            ]
          );
        }
      }
    }
  };

  if (!fontsLoaded || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>
          {locationLoading ? "Requesting location permission..." : "Loading fonts..."}
        </Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "red", marginBottom: 20 }}>{locationError}</Text>
        <TouchableOpacity
          onPress={() => {
            setLocationError(null);
            setLocationLoading(true);
          }}
        >
          <Text style={{ color: "#FFD700", textDecorationLine: "underline" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#888"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={validateEmail}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput
            style={styles.input}
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
                style={styles.input}
                placeholder="Re-enter Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={rePassword}
                onChangeText={validateRePassword}
              />
              {rePasswordError ? <Text style={styles.errorText}>{rePasswordError}</Text> : null}
            </>
          )}

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
            <LinearGradient
              colors={["#FFD700", "#32CD32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{isLogin ? "Login" : "Sign Up"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: "90%",
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#FFD700",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#2e2e2e",
    borderColor: "#444",
    borderWidth: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto_400Regular",
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  buttonText: {
    color: "#1c1c1c",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  switchText: {
    color: "#32CD32",
    marginTop: 5,
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
    backgroundColor: "#1c1c1c",
  },
  loadingText: {
    marginTop: 15,
    color: "#FFD700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1c1c1c",
  },
});

export default AuthScreen;

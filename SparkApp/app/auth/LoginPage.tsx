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
            [
              {
                text: "OK",
                onPress: () => {
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
      <CarLoadingScreen
        message={locationLoading ? "Requesting location permission..." : "Loading fonts..."}
      />
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

          {/* LOGIN / SIGNUP BUTTON */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9} style={{ width: "100%" }}>
            <LinearGradient
              colors={["#FFD700", "#32CD32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainButton}
            >
              <Text style={styles.mainButtonText}>{isLogin ? "Log in" : "Sign Up"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CREATE ACCOUNT / LOGIN SWITCH */}
          <TouchableOpacity onPress={toggleMode} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>
              {isLogin ? "Create new account" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>

          {/* FORGOT PASSWORD LINK */}
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

/* 🚗 Car Loading Screen Component */
const CarLoadingScreen = ({ message }: { message: string }) => {
  const carAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const loopAnimation = () => {
      carAnim.setValue(-200);
      Animated.timing(carAnim, {
        toValue: 400, // move across screen
        duration: 2500,
        useNativeDriver: true,
      }).start(() => loopAnimation());
    };
    loopAnimation();
  }, [carAnim]);

  return (
    <View style={styles.loadingContainer}>
      <Animated.Text style={[styles.car, { transform: [{ translateX: carAnim }] }]}>
        🚗💨
      </Animated.Text>
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
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
    fontSize: 20,
    letterSpacing: 1.2,
    fontFamily: "Poppins_700Bold",
  },
  outlineButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#32CD32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  outlineButtonText: {
    color: "#32CD32",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  forgotText: {
    color: "#FFD700",
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
  car: {
    fontSize: 40,
    marginBottom: 20,
  },
});

export default AuthScreen;

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";

export default function AuthSplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current; // fade-in for text
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current; // fade-out layer
  const progressAnim = useRef(new Animated.Value(-100)).current; // bar animation

  const [fontsLoaded] = useFonts({ Poppins_700Bold });

  useEffect(() => {
    if (fontsLoaded) {
      // Animate splash text in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Start progress bar loop
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 100,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();

      // After delay, fade splash out smoothly
      const timer = setTimeout(() => {
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 800, // smooth fade
          useNativeDriver: true,
        }).start(() => {
          router.replace("auth/LoginPage");
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#1c1c1c", "#2e2e2e", "#3a3a3a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={{ opacity: fadeOutAnim, alignItems: "center" }}>
        {/* App Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          SPARK
        </Animated.Text>

        {/* Loading bar */}
        <View style={styles.barContainer}>
          <Animated.View
            style={[
              styles.bar,
              {
                transform: [{ translateX: progressAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontFamily: "Poppins_700Bold",
    color: "#FFD700", // gold
    letterSpacing: 2,
    marginBottom: 30,
  },
  barContainer: {
    width: 200,
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    width: 80,
    height: "100%",
    backgroundColor: "#FFD700", // gold
    borderRadius: 3,
  },
});

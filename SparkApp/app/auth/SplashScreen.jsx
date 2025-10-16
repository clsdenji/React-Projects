import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Platform, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { MuseoModerno_700Bold } from "@expo-google-fonts/museomoderno";

const GREEN = "#7ED957";
const GOLD = "#FFDE59";

// make them travel farther if you want — this is horizontal distance
const TRACK_WIDTH = 280;

// extended duration for slower, smoother clash
const DURATION = 2600;

export default function AuthSplashScreen() {
  const router = useRouter();

  // transitions
  const inOpacity = useRef(new Animated.Value(0)).current;
  const inScale = useRef(new Animated.Value(0.96)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const veilOpacity = useRef(new Animated.Value(0)).current;

  // motion for both titles
  const greenX = useRef(new Animated.Value(-TRACK_WIDTH)).current; // left → right
  const yellowX = useRef(new Animated.Value(+TRACK_WIDTH)).current; // right → left

  const [fontsLoaded] = useFonts({ MuseoModerno_700Bold });

  useEffect(() => {
    if (!fontsLoaded) return;

    // entrance fade/scale
    Animated.parallel([
      Animated.timing(inOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(inScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // clash motion
    Animated.parallel([
      Animated.timing(greenX, {
        toValue: +TRACK_WIDTH,
        duration: DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(yellowX, {
        toValue: -TRACK_WIDTH,
        duration: DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // fade out after the longer animation
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(veilOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) router.replace("auth/LoginPage");
      });
    }, DURATION + 400); // small pause after the pass

    return () => clearTimeout(t);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000000", "#050505", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.center,
            { opacity: inOpacity, transform: [{ scale: inScale }] },
          ]}
        >
          <Animated.View style={{ opacity: contentOpacity, alignItems: "center" }}>
            {/* Clash container */}
            <View style={[styles.track, { width: TRACK_WIDTH }]}>
              {/* Green Spark */}
              <Animated.Text
                style={[styles.titleGreen, { transform: [{ translateX: greenX }] }]}
              >
                Spark
              </Animated.Text>

              {/* Yellow Spark */}
              <Animated.Text
                style={[styles.titleYellow, { transform: [{ translateX: yellowX }] }]}
              >
                Spark
              </Animated.Text>

              {/* Static ⚡ bolt */}
              <Text style={styles.bolt}>⚡</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Fade-out overlay */}
        <Animated.View pointerEvents="none" style={[styles.veil, { opacity: veilOpacity }]} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  track: {
    height: 80,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  titleGreen: {
    position: "absolute",
    fontSize: 54,
    fontFamily: "MuseoModerno_700Bold",
    color: GREEN,
    letterSpacing: 1.2,
    top: 2,
    opacity: 0.95,
    ...Platform.select({ android: { elevation: 0 } }),
  },

  titleYellow: {
    position: "absolute",
    fontSize: 54,
    fontFamily: "MuseoModerno_700Bold",
    color: GOLD,
    letterSpacing: 1.2,
    textShadowColor: "rgba(255, 222, 89, 0.45)",
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },

  bolt: {
    position: "absolute",
    fontSize: 28,
    color: GOLD,
    textShadowColor: "rgba(255, 222, 89, 0.35)",
    textShadowRadius: 10,
  },

  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});

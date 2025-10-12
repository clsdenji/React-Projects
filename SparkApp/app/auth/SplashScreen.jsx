import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Platform, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { MuseoModerno_700Bold } from "@expo-google-fonts/museomoderno";

const GREEN = "#7ED957";
const GOLD = "#FFDE59";

const BAR_CONTAINER_WIDTH = 220;
const BAR_CHUNK_WIDTH = 100;
const START_X = -BAR_CHUNK_WIDTH;
const END_X = BAR_CONTAINER_WIDTH;

export default function AuthSplashScreen() {
  const router = useRouter();

  // animations
  const inOpacity = useRef(new Animated.Value(0)).current;
  const inScale = useRef(new Animated.Value(0.96)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const veilOpacity = useRef(new Animated.Value(0)).current;
  const progressX = useRef(new Animated.Value(START_X)).current;
  const sparkPulse = useRef(new Animated.Value(1)).current; // pulse for ⚡

  const [fontsLoaded] = useFonts({ MuseoModerno_700Bold });

  useEffect(() => {
    if (!fontsLoaded) return;

    // entrance animation
    Animated.parallel([
      Animated.timing(inOpacity, {
        toValue: 1,
        duration: 500,
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

    // looping bars
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(progressX, {
          toValue: END_X,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progressX, {
          toValue: START_X,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnim.start();

    // pulsing ⚡
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkPulse, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(sparkPulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // fade-out transition
    const t = setTimeout(() => {
      progressX.stopAnimation(() => {
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(veilOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) router.replace("auth/LoginPage");
        });
      });
    }, 2400);

    return () => {
      clearTimeout(t);
      progressX.stopAnimation();
    };
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
          <Animated.View
            style={{ opacity: contentOpacity, alignItems: "center" }}
          >
            {/* 🔼 Top Loading Bar */}
            <View style={[styles.track, { marginBottom: 13 }]}>
              <View style={styles.barContainer}>
                <Animated.View style={{ transform: [{ translateX: progressX }] }}>
                  <LinearGradient
                    colors={[GOLD, GREEN]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.bar, { width: BAR_CHUNK_WIDTH }]}
                  />
                </Animated.View>
              </View>
            </View>

            <View style={styles.titleWrap}>
              <Animated.Text
                style={[
                  styles.sparkEmoji,
                  { transform: [{ scale: sparkPulse }] },
                ]}
              >
                ⚡
              </Animated.Text>
              <Animated.Text style={styles.titleBase}>SPARK</Animated.Text>
            </View>

            {/* 🔽 Bottom Loading Bar */}
            <View style={[styles.track, { marginTop: 20 }]}>
              <View style={styles.barContainer}>
                <Animated.View style={{ transform: [{ translateX: progressX }] }}>
                  <LinearGradient
                    colors={[GOLD, GREEN]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.bar, { width: BAR_CHUNK_WIDTH }]}
                  />
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* black fade overlay */}
        <Animated.View
          pointerEvents="none"
          style={[styles.veil, { opacity: veilOpacity }]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // --- TITLE + ⚡ ---
  titleWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  sparkEmoji: {
    fontSize: 32,
    color: GOLD,
    marginBottom: -8,
    textShadowColor: "rgba(255, 222, 89, 0.4)",
    textShadowRadius: 10,
  },
  titleBase: {
    fontSize: 54,
    fontFamily: "MuseoModerno_700Bold",
    color: GREEN,
    letterSpacing: 1.2,
    top: 2,
    opacity: 0.95,
    ...Platform.select({ android: { elevation: 0 } }),
  },

  // --- TRACK + BAR ---
  track: {
    width: BAR_CONTAINER_WIDTH,
    overflow: "hidden",
    alignItems: "flex-start",
  },
  barContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 222, 89, 0.18)",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },

  // --- VEIL ---
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});

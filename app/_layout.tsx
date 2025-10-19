import React, { useEffect, useCallback, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { MuseoModerno_700Bold } from "@expo-google-fonts/museomoderno";
import { Asset } from "expo-asset";

// Keep native splash visible while fonts & assets load
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ MuseoModerno_700Bold });
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await Asset.loadAsync([require("../assets/images/tile_image(1).png")]);
      setAssetsReady(true);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && assetsReady) {
      await SplashScreen.hideAsync(); // Hide native splash once ready
    }
  }, [fontsLoaded, assetsReady]);

  if (!fontsLoaded || !assetsReady) {
    return null; // Keep native splash up
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

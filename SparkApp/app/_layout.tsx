import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade", // 👈 smooth fade transition
      }}
    >
      {/* Splash screen first */}
      <Stack.Screen name="auth/SplashScreen" />

      {/* Login screen */}
      <Stack.Screen name="auth/LoginPage" />

      {/* Tabs after login */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

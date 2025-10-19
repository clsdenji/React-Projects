// app.config.ts
import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "SPARK",
  slug: "SparkApp",
  scheme: "sparkapp",
  newArchEnabled: true,

  ios: {
    bundleIdentifier: "com.anonymous.SparkApp",
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "This app needs your location to find nearby parking and show routes.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Your location may be used in the background to keep routes and ETAs up to date.",
    },
  },

  android: {
    package: "com.anonymous.SparkApp",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      // If you later add background tracking:
      // "ACCESS_BACKGROUND_LOCATION",
    ],
  },

  plugins: [
    "expo-dev-client",
    "@maplibre/maplibre-react-native", // ✅ Add this line to link MapLibre SDK
  ],

  extra: {
    appEnvironment: "production",
  },
});

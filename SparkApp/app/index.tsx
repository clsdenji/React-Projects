import { Redirect } from "expo-router";

export default function Index() {
  // Redirect "/" to SplashScreen
  return <Redirect href="/auth/SplashScreen" />;
}

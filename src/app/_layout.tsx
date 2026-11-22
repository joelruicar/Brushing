import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    AgravePro: require("../../assets/AgravePro.ttf"),
  });

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 1500);

    if (loaded || error) {
      void SplashScreen.hideAsync();
    }

    return () => clearTimeout(fallbackTimer);
  }, [error, loaded]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

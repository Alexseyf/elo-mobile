import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Roboto_Condensed-ExtraLight": require("../assets/fonts/Roboto_Condensed-ExtraLight.ttf"),
    "Roboto_Condensed-ExtraLightItalic": require("../assets/fonts/Roboto_Condensed-ExtraLightItalic.ttf"),
    "Roboto_Condensed-Regular": require("../assets/fonts/Roboto_Condensed-Regular.ttf"),
    "Roboto_Condensed-SemiBold": require("../assets/fonts/Roboto_Condensed-SemiBold.ttf"),
    "Roboto_Condensed-Light": require("../assets/fonts/Roboto_Condensed-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast position="top" />
    </>
  );
}

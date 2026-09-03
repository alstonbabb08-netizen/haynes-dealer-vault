import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { AuthProvider } from "@/src/auth";

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [iconsLoaded, iconError] = useIconFonts();
  const [appFontsLoaded] = useFonts({
    "Barlow-Regular": require("../assets/fonts/BarlowCondensed-Regular.ttf"),
    "Barlow-SemiBold": require("../assets/fonts/BarlowCondensed-SemiBold.ttf"),
    "Barlow-Bold": require("../assets/fonts/BarlowCondensed-Bold.ttf"),
    "Plex-Regular": require("../assets/fonts/IBMPlexSans-Regular.ttf"),
    "Plex-Medium": require("../assets/fonts/IBMPlexSans-Medium.ttf"),
    "Plex-SemiBold": require("../assets/fonts/IBMPlexSans-SemiBold.ttf"),
    "Plex-Bold": require("../assets/fonts/IBMPlexSans-Bold.ttf"),
  });
  const ready = (iconsLoaded || iconError) && appFontsLoaded;
  useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <AuthProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#09090B" }, animation: "fade" }} />
            </AuthProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

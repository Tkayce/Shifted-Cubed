import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppState } from "../lib/game/AppProvider";
import { getTheme } from "../lib/game/theme";

function RootLayoutContent() {
  const { settings } = useAppState();
  const theme = getTheme(settings.darkModeEnabled);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg.primary },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootLayoutContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

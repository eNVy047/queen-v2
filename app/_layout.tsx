import { Stack } from "expo-router";
import "../global.css";
import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import AuthSync from "@/components/AuthSync";
import { StatusBar } from "expo-status-bar";
import * as Sentry from "@sentry/react-native";
import SocketConnection from "@/components/SocketConnection";

Sentry.init({
  dsn: "https://b0ab155cfb535d6068bf5d240c0dfab8@o4508149123514368.ingest.us.sentry.io/4510844766650368",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.reactNativeTracingIntegration({
      traceFetch: true,
      traceXHR: true,
      enableHTTPTimings: true,
    }),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <SocketConnection />
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0D0D0F" } }}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="new-chat"
            options={{
              animation: "slide_from_bottom",
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="create-post"
            options={{
              animation: "slide_from_bottom",
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="user/[userId]"
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="post/[id]"
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
});

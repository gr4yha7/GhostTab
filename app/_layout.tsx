// app/_layout.tsx
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '../context/ErrorContext';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import '../global.css';

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AuthProvider>
          <NotificationProvider>
            <PrivyProvider
              appId={Constants.expoConfig?.extra?.privyAppId}
              clientId={Constants.expoConfig?.extra?.privyClientId}
            >
              <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="detail"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="create"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="chats"
                    options={{
                      presentation: 'pageSheet',
                    }}
                  />
                  <Stack.Screen
                    name="chat"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="notifications"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="settle"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="accept-invite"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="create-group"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="edit-group"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="group-detail"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="edit-tab"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                  <Stack.Screen
                    name="search-friends"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom'
                    }}
                  />
                </Stack>
              </SafeAreaProvider>
              <PrivyElements />
            </PrivyProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useLogin } from "@privy-io/expo/ui";
import { useIdentityToken } from "@privy-io/expo";
import { useRouter } from 'expo-router';
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingScreen() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { login } = useLogin();
  const { login: loginAuth } = useAuth();
  const { getIdentityToken } = useIdentityToken();

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleLogin = () => {
    setError("");
    setIsLoading(true);
    
    login({ 
      loginMethods: [
        "email", 
        "twitter", 
        "tiktok", 
        "google", 
        "apple", 
        "github", 
        "discord", 
        "linkedin"
      ] 
    })
      .then(async (session) => {
        const token = await getIdentityToken();
        console.log("session", session, "token", token);
        if (!token) {
          setError("Failed to get access token.");
          setIsLoading(false);
        }
        await loginAuth(token as string);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.error?.message || "Failed to login. Please try again.");
        setIsLoading(false);
      });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View className="px-8 justify-between">
            <View className="flex-1 justify-center items-center">
              <View className="relative w-48 h-48 mb-10 items-center justify-center">
                <View className="absolute inset-0 bg-indigo-100 rounded-full opacity-60" />
                <View className="absolute top-4 left-4 right-4 bottom-4 bg-white/40 rounded-2xl items-center justify-center shadow-sm transform -rotate-3">
                  <View className="items-center gap-2 opacity-50">
                    <View className="w-12 h-2 bg-slate-400 rounded-full" />
                    <View className="w-20 h-2 bg-slate-400 rounded-full" />
                  </View>
                </View>
                <View className="absolute top-8 left-12 right-0 bottom-0 bg-white/80 border border-white/50 rounded-2xl items-center justify-center shadow-lg transform rotate-6">
                  <Icon name="eye-off" size={48} color="#4f46e5" />
                </View>
              </View>
      
              <Text className="text-3xl font-semibold text-slate-900 mb-3">GhostTab</Text>
              <Text className="text-slate-500 text-base text-center leading-relaxed max-w-[260px]">
                Split expenses with friends instantly.{'\n'}Settle when you're ready.
              </Text>
            </View>
      
            <View className="w-full space-y-3 my-8">
              <Button onPress={handleLogin} icon="wallet">Connect Wallet</Button>
              <Text className="text-xs text-center text-slate-400 mt-4">By continuing, you agree to our Terms of Service.</Text>
            </View>
          </View>
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Icon name="shield-checkmark" size={16} color="#5b21b6" />
              <Text style={styles.footerText}>
                Secured by{" "}
                <Text style={styles.footerLink}>Privy</Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd6fe',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  titleSection: {
    marginBottom: 48,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    backgroundColor: '#5b21b6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  methodsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  methodTag: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTagText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: '#5b21b6',
    fontWeight: '600',
  },
  terms: {
    paddingTop: 8,
  },
  termsText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#faf5ff',
    top: -200,
    right: -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#f5f3ff',
    bottom: -150,
    left: -50,
    zIndex: 0,
  },
});
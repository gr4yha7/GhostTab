import 'dotenv/config';

export default () => ({
  expo: {
    name: "ghost-tab",
    slug: "ghost-tab",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ghosttab",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      usesAppleSignIn: true,
      supportsTablet: true,
      bundleIdentifier: "dev.privy.ghosttab",
      associatedDomains: ["webcredentials:<your-associated-domain>"],
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "dev.privy.ghosttab"
    },
    web: {
      favicon: "./assets/images/favicon.png",
      bundler: "metro"
    },
    extra: {
      privyAppId: process.env.PRIVY_APP_ID,
      privyClientId: process.env.PRIVY_CLIENT_ID,
      passkeyAssociatedDomain: "https://<your-associated-domain>"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-apple-authentication",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "17.5"
          },
          android: {
            compileSdkVersion: 35
          }
        }
      ],
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    }
  }
})

export default {
  expo: {
    name: "Ryde",
    slug: "uber",
    version: "1.0.0",
    orientation: "portrait",
    owner: "amanag",
    icon: "./assets/images/icon.png",
    scheme: "uberclone",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.amanag.uber",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#ffffff",
      },
      package: "com.amanag.uber",
      usesCleartextTraffic: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "", // Use actual key from .env
        },
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
      ],
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Ryde to use your location.",
        },
      ],
      "expo-router",
      "expo-secure-store",
      "expo-font",
    ],
    extra: {
      eas: {
        projectId: "17e2170e-f739-4da3-bff2-e1f1a79fb2a7",
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};

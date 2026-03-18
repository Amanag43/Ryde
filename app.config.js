import "dotenv/config";

export default {
  expo: {
    name: "Uber",
    slug: "uber",
    version: "1.0.0",
    orientation: "portrait",
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
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      // ✅ Mapbox — replaces react-native-maps
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
        },
      ],
      // ✅ Location
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Uber to use your location.",
        },
      ],
      // ✅ Router
      [
        "expo-router",
        {
          origin: "https://uber.com/",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
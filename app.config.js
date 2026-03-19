import "dotenv/config";

export default {
expo: {
name: "Uber",
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
extra:{
eas:{
projectId: "17e2170e-f739-4da3-bff2-e1f1a79fb2a7"
}
},
ios: {
supportsTablet: true,
},
android: {
adaptiveIcon: {
foregroundImage: "./assets/images/android-icon-foreground.png",
backgroundColor: "#ffffff",
},
package: "com.amanag.uber",
config: {
googleMaps: {
apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY, // ✅ added
},
},
},
web: {
bundler: "metro",
output: "server",
favicon: "./assets/images/favicon.png",
},
plugins: [
 [
    "@rnmapbox/maps",
    {
      RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    }
  ],
[
"expo-location",  // ✅ added
{
locationAlwaysAndWhenInUsePermission: "Allow Uber to use your location.",
},
],
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
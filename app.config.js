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
"react-native-maps",  // ✅ added
{
googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
},
],
[
"@stripe/stripe-react-native",  // ✅ added
{
merchantIdentifier: "merchant.com.yourapp",
enableGooglePay: false,
},
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
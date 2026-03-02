import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait until Clerk loads
  if (!isLoaded) return null;

  // If logged in → go to app
  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  // If not logged in → go to welcome/auth
  return <Redirect href="/(auth)/welcome" />;
}
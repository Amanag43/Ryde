import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, Text, Image, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import RideCard from "@/components/RideCard";
import { images, icons } from "@/constants/onboarding";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Map from "@/components/Map";
import { useFetch } from "@/lib/fetch";
import { useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const { data: recentRides, loading } = useFetch<any[]>(
    user?.id ? `/ride/${user.id}` : null as any
  );

  const handleSignOut = () => {
    signOut();
    router.replace("/sign-in");
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/find-ride");
  };

  const DEFAULT_LOCATION = {
    latitude: 28.6139,
    longitude: 77.2090,
    address: "Delhi, India",
  };

  useEffect(() => {
    const requestLocation = async () => {
      try {
        console.log("📍 Requesting location permissions...");
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("❌ Location permission denied");
          setUserLocation(DEFAULT_LOCATION);
          return;
        }

        console.log("🛰️ Fetching current position...");
        // ✅ Fast position fetch for UI responsiveness
        let location = await Location.getCurrentPositionAsync({
            accuracy: Platform.OS === 'android' ? Location.Accuracy.Low : Location.Accuracy.Balanced,
        });

        console.log("📍 Location found:", location.coords.latitude, location.coords.longitude);

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const formattedAddress = address[0]
          ? `${address[0].name || ''}, ${address[0].city || address[0].region || ''}`.trim()
          : "Current Location";

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: formattedAddress || "Current Location",
        });

      } catch (error) {
        console.error("❌ Location error:", error);
        setUserLocation(DEFAULT_LOCATION);
      }
    };
    requestLocation();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {user?.firstName || 'Rider'}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your current location
              </Text>
              <View
                style={{
                  height: 300,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#e5e7eb",
                }}
              >
                <Map />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
}

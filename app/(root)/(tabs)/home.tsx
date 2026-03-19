import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, Text, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import RideCard from "@/components/RideCard";
import { images } from "@/constants/onboarding";
import { icons } from "@/constants/onboarding";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Map from "@/components/Map";
import { useFetch } from "@/lib/fetch";
import { useAuth, useUser as useClerkUser } from "@clerk/clerk-expo";

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // ✅ Fixed URL — absolute with server URL
  const { data: recentRides, loading } = useFetch(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/ride/${user?.id}`
  );

  const [hasPermissions, setHasPermissions] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };
  const DEFAULT_LOCATION = {
    latitude: 28.6139,   // Delhi
    longitude: 77.2090,
    address: "Delhi",
  };

  useEffect(() => {
    const requestLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setHasPermissions(false);
          setUserLocation(DEFAULT_LOCATION);

          return; // ✅ just return, no forced location
        }

        let location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });

      } catch (error) {
        console.error("Location error:", error);
        // ✅ no fallback — just silently fail
      }
    };
    requestLocation();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
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
                Welcome {user?.firstName}👋
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
              {/* ✅ Fixed — removed flex-row which was blocking gestures */}
              <View
                style={{
                  height: 300,
                  borderRadius: 16,
                  overflow: "hidden", // ✅ rounded corners
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
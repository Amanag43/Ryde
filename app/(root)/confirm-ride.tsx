import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useFetch } from "@/lib/fetch";
import { calculateDriverTimes, generateMarkersFromData } from "@/lib/map";
import { useLocationStore } from "@/store";
import { useDriverStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { useEffect } from "react";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { userLatitude, userLongitude, destinationLatitude, destinationLongitude } = useLocationStore();
  const { data: driverResponse, loading, error, refetch } = useFetch<Driver[]>("/driver");

  useEffect(() => {
    if (!Array.isArray(driverResponse)) return;

    const driverMarkers = generateMarkersFromData({
      data: driverResponse,
      userLatitude: userLatitude ?? 28.6139,
      userLongitude: userLongitude ?? 77.209,
    });

    // Show available drivers immediately. Route estimates are a best-effort enhancement.
    useDriverStore.getState().setDrivers(driverMarkers);

    if (userLatitude == null || userLongitude == null || destinationLatitude == null || destinationLongitude == null) return;

    let cancelled = false;
    calculateDriverTimes({
      markers: driverMarkers,
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    }).then((timedDrivers) => {
      if (!cancelled && timedDrivers) useDriverStore.getState().setDrivers(timedDrivers);
    });

    return () => { cancelled = true; };
  }, [driverResponse, userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const displayedDrivers = drivers as MarkerData[];

  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      {loading && displayedDrivers.length === 0 ? (
        <View className="items-center p-6"><ActivityIndicator /><Text className="mt-3">Loading drivers…</Text></View>
      ) : error ? (
        <View className="items-center p-6">
          <Text className="text-center">Could not load drivers. Check your connection and server URL.</Text>
          <CustomButton title="Try again" onPress={refetch} className="mt-4" />
        </View>
      ) : displayedDrivers.length === 0 ? (
        <View className="items-center p-6"><Text>No drivers are available right now.</Text></View>
      ) : (
        <FlatList
          data={displayedDrivers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <DriverCard item={item} selected={selectedDriver ?? -1} setSelected={() => setSelectedDriver(item.id)} />
          )}
          ListFooterComponent={() => (
            <View className="mx-5 mt-10">
              <CustomButton
                title="Select Ride"
                onPress={() => router.push("/(root)/book-ride")}
              />
            </View>
          )}
        />
      )}
    </RideLayout>
  );
};

export default ConfirmRide;

import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import {FlatList} from "react-native";
import RideCard from "@/components/RideCard";
import {View,Text,Image} from "react-native";
import { images } from "@/constants/onboarding";
import {ActivityIndicator} from "react-native";
import {TouchableOpacity} from "react-native";
import { icons } from "@/constants/onboarding";
import GoogleTextInput from "@/components/GoogleTextInput";
import {useLocationStore} from "@/store";
import  { useRouter } from "expo-router";
import {useEffect, useState} from "react";
import Map from "@/components/Map";
import {useFetch} from "@/lib/fetch"
import { useAuth } from '@clerk/clerk-expo'
export default function Page() {
    const {setUserLocation,setDestinationLocation} = useLocationStore();
  const { user } = useUser();
  const {signOut} = useAuth();
    const router = useRouter();
    const { data: recentRides, loading} =useFetch(`/(api)/ride/${user?.id}`);

  const[hasPermissions , setHasPermissions] = useState(false);
  const handleSignOut=()=> {

      signOut();
      router.replace("/(auth)/sign-in");

      };
  const handleDestinationPress=(location: {
      latitude: number,
      longitude: number,
      address: string;
      }) => {
          setDestinationLocation(location);

          router.push('/(root)/find-ride');
          };


  useEffect(() => {
    const requestLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          // ✅ Fallback if permission denied
          setUserLocation({
            latitude: 37.78825,
            longitude: -122.4324,
            address: "San Francisco, CA",
          });
          return;
        }

        try {
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
        } catch (locationError) {
          // ✅ Fallback if emulator has no GPS signal
          setUserLocation({
            latitude: 37.78825,
            longitude: -122.4324,
            address: "San Francisco, CA",
          });
        }

      } catch (error) {
        // ✅ Fallback for any other error
        setUserLocation({
          latitude: 37.78825,
          longitude: -122.4324,
          address: "San Francisco, CA",
        });
      }
    };
    requestLocation();
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <FlatList
      data={recentRides ?.slice(0,5)}

 renderItem={({item}) => <RideCard ride={item} />}
 className="px-5"
 keyboardShouldPersistTaps="handled"
 contentContainerStyle={{
     paddingBottom: 100,
     }}
 ListEmptyComponent={() =>
(     <View className ="flex flex-col items-center justify-center">
    {!loading ? (
        <>
        <Image source ={images.noResult} className="w-40 h-40"
        alt="No recent rides found"
        resizeMode="contain"/>
        <Text className="text-sm">No recent rides found</Text>
        </>
        ) : (
            <ActivityIndicator size="small" color ="#000"/>
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
              <View className="flex flex-row items-center bg-transparent h-[300px]">
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
};

import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import RazorpayCheckout from "react-native-razorpay";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants/onboarding";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState(false);

  const openPaymentSheet = async () => {
    try {
      const options = {
        description: "Ride Payment",
        image: "https://i.imgur.com/3g7nmJC.png", // ✅ your app logo
        currency: "INR",
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
        amount: parseInt(amount) * 100, // ✅ Razorpay takes amount in paise
        name: "Uber Clone",
        prefill: {
          email: email,
          contact: "",
          name: fullName,
        },
        theme: { color: "#0286FF" },
      };

      // ✅ Open Razorpay payment sheet
      const data = await RazorpayCheckout.open(options);

      // ✅ Payment successful — save ride to database
      if (data.razorpay_payment_id) {
        await fetchAPI(`${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/ride/create`, {
          method: "POST",
          body: JSON.stringify({
            origin_address: userAddress,
            destination_address: destinationAddress,
            origin_latitude: userLatitude,
            origin_longitude: userLongitude,
            destination_latitude: destinationLatitude,
            destination_longitude: destinationLongitude,
            ride_time: rideTime.toFixed(0),
            fare_price: parseInt(amount),
            payment_status: "paid",
            driver_id: driverId,
            user_id: userId,
          }),
        });

        setSuccess(true);
      }
    } catch (error: any) {
      // ✅ User cancelled or payment failed
      if (error.code === 2) {
        // code 2 = user cancelled — don't show error
        return;
      }
      Alert.alert("Payment Failed", error.description || "Something went wrong");
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
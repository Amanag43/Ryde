import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/onboarding";
import { formatTime } from "@/lib/utils";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  // ✅ Build avatar URL safely
  const avatarUrl = item.profile_image_url
    ? item.profile_image_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.first_name)}+${encodeURIComponent(item.last_name)}&background=0286FF&color=fff&size=128`;

  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`${
        selected === item.id ? "bg-general-600" : "bg-white"
      } flex flex-row items-center justify-between py-5 px-3 rounded-xl`}
    >
      {/* ✅ Fixed — using style instead of className for dimensions */}
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: 56, height: 56, borderRadius: 28 }}
      />

      <View className="flex-1 flex flex-col items-start justify-center mx-3">
        <View className="flex flex-row items-center justify-start mb-1">
          <Text className="text-lg font-JakartaRegular">
            {item.first_name} {item.last_name}
          </Text>
          <View className="flex flex-row items-center space-x-1 ml-2">
            <Image source={icons.star} style={{ width: 14, height: 14 }} />
            <Text className="text-sm font-JakartaRegular">
              {item.rating ?? "4"}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <Text className="text-sm font-JakartaRegular">₹{item.price}</Text>

          <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {item.time ? formatTime(item.time) : "N/A"}
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800">
            {item.car_seats} seats
          </Text>
        </View>
      </View>

      {/* ✅ Fixed car image too */}
      <Image
        source={{ uri: item.car_image_url }}
        style={{ width: 56, height: 56 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default DriverCard;
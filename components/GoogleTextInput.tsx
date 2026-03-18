import { View, Image, TextInput, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { icons } from "@/constants/onboarding";
import { GoogleInputProps } from "@/types/type";

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`
      );
      const data = await response.json();
      const formatted = data.features.map((feature: any) => ({
        place_id: feature.properties.osm_id,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        display_name: [
          feature.properties.name,
          feature.properties.city,
          feature.properties.country,
        ]
          .filter(Boolean)
          .join(", "),
      }));
      setResults(formatted);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
  };

  const handleSelect = (item: any) => {
    handlePress({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.display_name,
    });
    setQuery(item.display_name);
    setResults([]);
  };

  return (
    <View className={`flex flex-col relative z-50 rounded-xl ${containerStyle}`}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: textInputBackgroundColor ?? "white",
          borderRadius: 200,
          paddingHorizontal: 12,
          marginHorizontal: 20,
          shadowColor: "#d4d4d4",
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Image
          source={icon ? icon : icons.search}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
        <TextInput
          value={query}
          onChangeText={searchPlaces}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="gray"
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            marginBottom: 5,
            marginLeft: 8,
            backgroundColor: "transparent",
          }}
        />
      </View>

      {results.length > 0 && (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            marginHorizontal: 20,
            marginTop: 4,
            shadowColor: "#d4d4d4",
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 5,
            maxHeight: 200,
            overflow: "hidden",
          }}
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.place_id?.toString()}
              onPress={() => handleSelect(item)}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Text numberOfLines={2} style={{ fontSize: 14, color: "#333" }}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
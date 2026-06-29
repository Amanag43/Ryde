import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants/onboarding";

const RideLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>

        {/* ── Map fills the whole screen behind the bottom sheet ── */}
        <View style={styles.mapContainer}>

          {/* Back button + title overlay */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <View style={styles.backBtn}>
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  style={{ width: 24, height: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>{title || "Go Back"}</Text>
          </View>

          {/* Map takes all available space */}
          <Map />
        </View>

        {/* ── Bottom sheet slides up over the map ── */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["40%", "85%"]}
          index={0}
        >
          <BottomSheetView style={styles.sheetContent}>
            {children}
          </BottomSheetView>
        </BottomSheet>

      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  mapContainer: {
    flex: 1,           // ← fills all available height reliably on Android
  },
  header: {
    position: "absolute",
    zIndex: 10,
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 64,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Jakarta-SemiBold",  // keep your font
    marginLeft: 20,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
});

export default RideLayout;
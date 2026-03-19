import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

// ✅ Set Mapbox token once
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/driver`
  );
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<number[][]>([]);

  // ✅ Place drivers near user when data loads
  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  // ✅ Calculate driver times when destination is set
  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((result) => {
        setDrivers(result as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  // ✅ Fetch REAL road route from Mapbox Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) return;

      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userLongitude},${userLatitude};${destinationLongitude},${destinationLatitude}?geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setRouteCoords(data.routes[0].geometry.coordinates);
        }
      } catch (err) {
        console.error("Route error:", err);
      }
    };
    fetchRoute();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  if (loading || userLatitude == null || userLongitude == null) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  const lat = userLatitude ?? 37.78825;
  const lng = userLongitude ?? -122.4324;

  return (
    <MapboxGL.MapView
      style={{ flex: 1, width: "100%", height: "100%" }}
      styleURL={MapboxGL.StyleURL.Street}  // ✅ Beautiful Mapbox style
      logoEnabled={false}
      attributionEnabled={false}
    >
      {/* ✅ Camera — controls what the map shows */}
      <MapboxGL.Camera
        zoomLevel={14}
        centerCoordinate={[lng, lat]}
        animationMode="flyTo"
        animationDuration={1000}
      />

      {/* ✅ User location — blue dot */}
      <MapboxGL.UserLocation
        visible={true}
        showsUserHeadingIndicator={true}
      />

      {/* ✅ Driver markers */}
      {markers.map((marker) => (
        <MapboxGL.PointAnnotation
          key={marker.id.toString()}
          id={marker.id.toString()}
          coordinate={[marker.longitude, marker.latitude]}
        >
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: selectedDriver === +marker.id ? "#0286FF" : "#22c55e",
              borderRadius: 7,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        </MapboxGL.PointAnnotation>
      ))}

      {/* ✅ Destination marker */}
      {destinationLatitude && destinationLongitude && (
        <MapboxGL.PointAnnotation
          key="destination"
          id="destination"
          coordinate={[destinationLongitude, destinationLatitude]}
        >
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: "#ef4444",
              borderRadius: 7,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        </MapboxGL.PointAnnotation>
      )}

      {/* ✅ Real road route */}
      {routeCoords.length > 0 && (
        <MapboxGL.ShapeSource
          id="routeSource"
          shape={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeCoords,
            },
          }}
        >
          <MapboxGL.LineLayer
            id="routeLayer"
            style={{
              lineColor: "#0286FF",
              lineWidth: 4,
              lineOpacity: 0.8,
            }}
          />
        </MapboxGL.ShapeSource>
      )}
    </MapboxGL.MapView>
  );
};

export default Map;
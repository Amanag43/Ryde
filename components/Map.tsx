import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useFetch } from "@/lib/fetch";
import { calculateDriverTimes, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const Map = () => {
  const mapRef = useRef<MapView>(null);
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();
  const { data: drivers } = useFetch<Driver[]>("/driver");

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (userLatitude && userLongitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLatitude, userLongitude]);

  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      setMarkers(generateMarkersFromData({ data: drivers, userLatitude, userLongitude }));
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude != null && destinationLongitude != null) {
      calculateDriverTimes({ markers, userLatitude, userLongitude, destinationLatitude, destinationLongitude })
        .then((result) => { if (result) setDrivers(result as MarkerData[]); });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  // OSRM route with straight-line fallback
  useEffect(() => {
    if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) return;

    const fetchRoute = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLongitude},${userLatitude};${destinationLongitude},${destinationLatitude}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await response.json();
        if (data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => ({
            latitude: c[1], longitude: c[0],
          }));
          setRouteCoords(coords);
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        }
      } catch {
        // fallback: straight line
        setRouteCoords([
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: destinationLatitude, longitude: destinationLongitude },
        ]);
      }
    };
    fetchRoute();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  if (userLatitude == null || userLongitude == null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id.toString()}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
          >
            <View style={[styles.dot, { backgroundColor: selectedDriver === +marker.id ? "#0286FF" : "#22c55e" }]} />
          </Marker>
        ))}

        {destinationLatitude != null && destinationLongitude != null && (
          <Marker coordinate={{ latitude: destinationLatitude, longitude: destinationLongitude }} title="Destination">
            <View style={[styles.dot, { backgroundColor: "#ef4444" }]} />
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#0286FF" strokeWidth={4} />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
  map: { width: "100%", height: "100%" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "white" },
});

export default Map;
// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, Text, View } from "react-native";
// import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
//
// import { icons } from "@/constants/onboarding";
// import { useFetch } from "@/lib/fetch";
// import {
//   calculateDriverTimes,
//   calculateRegion,
//   generateMarkersFromData,
// } from "@/lib/map";
// import { useDriverStore, useLocationStore } from "@/store";
// import { Driver, MarkerData } from "@/types/type";
//
// const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;
//
// const Map = () => {
//   const {
//     userLongitude,
//     userLatitude,
//     destinationLatitude,
//     destinationLongitude,
//   } = useLocationStore();
//   const { selectedDriver, setDrivers } = useDriverStore();
//
//   const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
//   const [markers, setMarkers] = useState<MarkerData[]>([]);
//
//   useEffect(() => {
//     if (Array.isArray(drivers)) {
//       if (!userLatitude || !userLongitude) return;
//
//       const newMarkers = generateMarkersFromData({
//         data: drivers,
//         userLatitude,
//         userLongitude,
//       });
//
//       setMarkers(newMarkers);
//     }
//   }, [drivers, userLatitude, userLongitude]);
//
//   useEffect(() => {
//     if (
//       markers.length > 0 &&
//       destinationLatitude !== undefined &&
//       destinationLongitude !== undefined
//     ) {
//       calculateDriverTimes({
//         markers,
//         userLatitude,
//         userLongitude,
//         destinationLatitude,
//         destinationLongitude,
//       }).then((drivers) => {
//         setDrivers(drivers as MarkerData[]);
//       });
//     }
//   }, [markers, destinationLatitude, destinationLongitude]);
//
//   const region = calculateRegion({
//     userLatitude,
//     userLongitude,
//     destinationLatitude,
//     destinationLongitude,
//   });
//
//   if (loading || (!userLatitude && !userLongitude))
//     return (
//       <View className="flex justify-between items-center w-full">
//         <ActivityIndicator size="small" color="#000" />
//       </View>
//     );
//
//   if (error)
//     return (
//       <View className="flex justify-between items-center w-full">
//         <Text>Error: {error}</Text>
//       </View>
//     );
//
//   return (
//     <MapView
//       provider={PROVIDER_DEFAULT}
//       className="w-full h-full rounded-2xl"
//       tintColor="black"
//       mapType="mutedStandard"
//       showsPointsOfInterest={false}
//       initialRegion={region}
//       showsUserLocation={true}
//       userInterfaceStyle="light"
//     >
//       {markers.map((marker, index) => (
//         <Marker
//           key={marker.id}
//           coordinate={{
//             latitude: marker.latitude,
//             longitude: marker.longitude,
//           }}
//           title={marker.title}
//           image={
//             selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
//           }
//         />
//       ))}
//
//       {destinationLatitude && destinationLongitude && (
//         <>
//           <Marker
//             key="destination"
//             coordinate={{
//               latitude: destinationLatitude,
//               longitude: destinationLongitude,
//             }}
//             title="Destination"
//             image={icons.pin}
//           />
//           <MapViewDirections
//             origin={{
//               latitude: userLatitude!,
//               longitude: userLongitude!,
//             }}
//             destination={{
//               latitude: destinationLatitude,
//               longitude: destinationLongitude,
//             }}
//             apikey={directionsAPI}
//             strokeColor="#0286FF"
//             strokeWidth={2}
//           />
//         </>
//       )}
//     </MapView>
//   );
// };
//
// export default Map;
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Error: {error}</Text>
      </View>
    );

  const lat = userLatitude ?? 37.78825;
  const lng = userLongitude ?? -122.4324;

  // Build markers JS for all drivers
  const driverMarkersJS = markers
    .map((marker) => {
      const isSelected = selectedDriver === +marker.id;
      const color = isSelected ? "#0286FF" : "#22c55e";
      return `
        L.marker([${marker.latitude}, ${marker.longitude}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
            iconSize: [14,14],
            iconAnchor: [7,7],
          })
        }).addTo(map).bindPopup("${marker.title}");
      `;
    })
    .join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${lat}, ${lng}], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // User location marker (blue dot)
        L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:#0286FF;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>',
            iconSize: [16,16],
            iconAnchor: [8,8],
          })
        }).addTo(map).bindPopup("You").openPopup();

        // Driver markers
        ${driverMarkersJS}

        ${destinationLatitude && destinationLongitude ? `
        // Destination marker (red dot)
        L.marker([${destinationLatitude}, ${destinationLongitude}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
            iconSize: [14,14],
            iconAnchor: [7,7],
          })
        }).addTo(map).bindPopup("Destination");

        // Route line
        L.polyline([
          [${lat}, ${lng}],
          [${destinationLatitude}, ${destinationLongitude}]
        ], {color: '#0286FF', weight: 3}).addTo(map);

        // Fit map to show all points
        map.fitBounds([
          [${lat}, ${lng}],
          [${destinationLatitude}, ${destinationLongitude}]
        ], {padding: [50, 50]});
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ flex: 1, width: "100%", height: "100%" }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
      />
    </View>
  );
};

export default Map;
import { Driver, MarkerData } from "@/types/type";

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (userLatitude == null || userLongitude == null) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  return {
    latitude: (userLatitude + destinationLatitude) / 2,
    longitude: (userLongitude + destinationLongitude) / 2,
    latitudeDelta: (maxLat - minLat) * 1.3,
    longitudeDelta: (maxLng - minLng) * 1.3,
  };
};

// ✅ Replaced Google Directions API with free OSRM
const getOSRMDuration = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number> => {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
  );
  const data = await response.json();
  if (data.routes && data.routes.length > 0) {
    return data.routes[0].duration; // seconds
  }
  // ✅ Fallback: estimate based on straight-line distance if OSRM fails
  const R = 6371e3;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (distance / 1000 / 50) * 3600; // assume 50km/h
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
   userLatitude == null ||
       userLongitude == null ||
       destinationLatitude == null ||
       destinationLongitude == null
  )
    return;

  try {
       const userToDestinationTime = await getOSRMDuration(
            userLatitude,
            userLongitude,
            destinationLatitude,
            destinationLongitude
          );

    const timesPromises = markers.map(async (marker) => {
      // ✅ Driver to user
      const driverToUserTime = await getOSRMDuration(
        marker.latitude,
        marker.longitude,
        userLatitude,
        userLongitude
      );
      const totalTime = (driverToUserTime + userToDestinationTime) / 60; // minutes
      const price = (totalTime * 0.5).toFixed(2);

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};
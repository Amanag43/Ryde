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
      latitude: 28.6139,   // ✅ Default to Delhi instead of San Francisco
      longitude: 77.2090,
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

const getOSRMDuration = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ duration: number; distance: number }> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
    );
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return {
        duration: data.routes[0].duration, // seconds
        distance: data.routes[0].distance, // meters
      };
    }
  } catch (err) {
    console.error("OSRM error:", err);
  }

  // Fallback — straight line estimate
  const R = 6371e3;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return {
    duration: (distance / 1000 / 40) * 3600,
    distance,
  };
};

// ✅ Realistic Indian Uber pricing
const calculatePrice = (distanceMeters: number): string => {
  const distanceKm = distanceMeters / 1000;
  const baseFare = 30;          // ₹30 base fare
  const perKmRate = 12;         // ₹12 per km
  const total = baseFare + distanceKm * perKmRate;
  return Math.round(total).toString(); // ✅ round to whole number — no decimals
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
    const userToDestination = await getOSRMDuration(
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude
    );

    const timesPromises = markers.map(async (marker) => {
      const driverToUser = await getOSRMDuration(
        marker.latitude,
        marker.longitude,
        userLatitude,
        userLongitude
      );

      const totalTimeMinutes = (driverToUser.duration + userToDestination.duration) / 60;
      const totalDistance = driverToUser.distance + userToDestination.distance;

      return {
        ...marker,
        time: Math.round(totalTimeMinutes * 10) / 10, // ✅ 1 decimal e.g. 6.5
        price: calculatePrice(totalDistance),          // ✅ ₹ based on distance
      };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};
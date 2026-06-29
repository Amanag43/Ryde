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
      latitude: 24.2679,   // Default to Jharkhand
      longitude: 87.2410,
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
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
  };
};

// ─── Haversine straight-line distance ────────────────────────────────────────
const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // metres
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Try OSRM, fall back to haversine silently ───────────────────────────────
const getDuration = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ duration: number; distance: number }> => {
  const fallback = () => {
    const distance = haversineDistance(fromLat, fromLng, toLat, toLng);
    return { duration: (distance / 1000 / 40) * 3600, distance };
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return {
        duration: data.routes[0].duration,
        distance: data.routes[0].distance,
      };
    }
  } catch {
    // OSRM unavailable or timed out — use haversine
  }

  return fallback();
};

// ─── Fetch full route geometry from OSRM, fall back to straight line ─────────
export const fetchRouteCoords = async (
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): Promise<{ latitude: number; longitude: number }[]> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
    }
  } catch {
    // fall through
  }

  // ✅ Fallback: straight-line between the two points
  console.warn("OSRM unavailable — using straight-line route");
  return [
    { latitude: userLat, longitude: userLng },
    { latitude: destLat, longitude: destLng },
  ];
};

// ─── Realistic Indian Uber pricing ───────────────────────────────────────────
const calculatePrice = (distanceMeters: number): string => {
  const distanceKm = distanceMeters / 1000;
  const baseFare = 30;    // ₹30 base fare
  const perKmRate = 12;   // ₹12 per km
  return Math.round(baseFare + distanceKm * perKmRate).toString();
};

// ─── Driver times ─────────────────────────────────────────────────────────────
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
    const userToDestination = await getDuration(
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude
    );

    const timesPromises = markers.map(async (marker) => {
      const driverToUser = await getDuration(
        marker.latitude,
        marker.longitude,
        userLatitude,
        userLongitude
      );

      const totalTimeMinutes =
        (driverToUser.duration + userToDestination.duration) / 60;
      const totalDistance = driverToUser.distance + userToDestination.distance;

      return {
        ...marker,
        time: Math.round(totalTimeMinutes * 10) / 10,
        price: calculatePrice(totalDistance),
      };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};
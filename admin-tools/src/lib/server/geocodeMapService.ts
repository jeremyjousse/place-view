"use server";

export type LocationPrediction = {
  id: string;
  latitude: number;
  longitude: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
};

export type GeocodeMapsResponse = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

export const getLocationPrediction = async (
  locationSearch: string
): Promise<LocationPrediction[]> => {
  const url = `https://geocode.maps.co/search?city=${encodeURIComponent(
    locationSearch
  )}&api_key=${process.env.GEOCODE_MAPS_KEY}`;

  const response = await fetch(url);
  const geocodeMapsResponse = (await response.json()) as GeocodeMapsResponse[];

  // TODO filter duplicate
  return geocodeMapsResponse.map((place) => {
    const displayNameParts = place.display_name.split(",");

    return {
      id: place.place_id.toString(),
      latitude: Number.parseFloat(place.lat),
      longitude: Number.parseFloat(place.lon),
      displayName: place.display_name,
      city: displayNameParts[0] || "",
      state: displayNameParts[1] || "",
      country: displayNameParts.pop() || "",
    };
  });
};

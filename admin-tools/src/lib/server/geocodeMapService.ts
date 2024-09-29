"use server";

export type LocationPrediction = {
  id: string;
  latitude: number;
  longitude: number;
  displayName: string;
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
  const mappedPredictions = geocodeMapsResponse.map((place) => {
    return {
      id: place.place_id.toString(),
      latitude: Number.parseFloat(place.lat),
      longitude: Number.parseFloat(place.lon),
      displayName: place.display_name,
    };
  });

  return mappedPredictions.filter(
    (data, index) =>
      mappedPredictions.findIndex(
        (obj) => obj.displayName == data.displayName
      ) === index
  );
};

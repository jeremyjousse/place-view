"use server";

import { readFileSync, writeFileSync } from "fs";

import Place from "@/domain/Place";

const JSON_PLACE_FILE_PATH = "../place-view/Resources/places.json";

export const updatePlace = async (place: Place) => {
  const places = await listPlaces();

  const placeIndex = places.findIndex(
    (originalPlace) => originalPlace.id == place.id
  );

  if (placeIndex > -1) {
    places[placeIndex] = place;
  } else {
    places.push(place);
  }

  writeFileSync(JSON_PLACE_FILE_PATH, JSON.stringify(places, null, 2));
};

export const listPlaces = async (): Promise<Place[]> => {
  return JSON.parse(readFileSync(JSON_PLACE_FILE_PATH).toString()) as Place[];
};

export const placeDetail = async (
  placeId: string
): Promise<Place | undefined> => {
  const places = await listPlaces();
  return places.find((place) => place.id == placeId);
};

"use server";

import { readFileSync, writeFileSync } from "fs";

import { PlaceDto } from "@/domain/Place";

const JSON_PLACE_FILE_PATH = "../place-view/Resources/places.json";

export const updatePlace = async (place: PlaceDto) => {
  const places = await listPlaces();

  const placeIndex = places.findIndex(
    (originalPlace) => originalPlace.id == place.id
  );

  if (placeIndex > -1) {
    places[placeIndex] = place;
  } else {
    places.push(place);
  }

  places.sort((a, b) => a.id.localeCompare(b.id));

  writeFileSync(JSON_PLACE_FILE_PATH, JSON.stringify(places, null, 2));
};

export const listPlaces = async (): Promise<PlaceDto[]> => {
  return JSON.parse(
    readFileSync(JSON_PLACE_FILE_PATH).toString()
  ) as PlaceDto[];
};

export const placeDetail = async (
  placeId: string
): Promise<PlaceDto | undefined> => {
  const places = await listPlaces();
  return places.find((place) => place.id == placeId);
};

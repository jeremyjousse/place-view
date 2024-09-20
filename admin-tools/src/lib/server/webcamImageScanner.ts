"use server";

import Webcam from "@/domain/Webcam";
import { listPlaces } from "./placeService";

export const listBadWebcams = async (): Promise<Webcam[]> => {
  const places = await listPlaces();
  const webcams = places.flatMap((place) => place.webcams);
  const badWebcams = await webcams.reduce(async (acc, curr) => {
    const isBadWebcam = await detectBadWebcam(curr);
    if (isBadWebcam) {
      (await acc).push(curr);
    }
    return acc;
  }, Promise.resolve([] as Webcam[]));
  return badWebcams;
};

export const detectBadWebcam = async (webcam: Webcam): Promise<boolean> => {
  try {
    const fetchedImageStatus = await fetch(webcam.thumbnailImage, {
      signal: AbortSignal.timeout(2000),
    });
    return fetchedImageStatus.status != 200;
  } catch (_) {
    return true;
  }
};

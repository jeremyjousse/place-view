"use server";

import * as cheerio from "cheerio";

import Webcam from "@/domain/Webcam";

export const detectWebcamType = async (
  webcamUrl: string
): Promise<Webcam | null> => {
  if (webcamUrl.startsWith("https://www.skaping.com")) {
    return await extractWebcamFromSkapingWebsite(webcamUrl);
  }

  if (webcamUrl.startsWith("https://www.trinum.com/ibox/ftpcam/")) {
    return extractWebcamFromTrinumImage(webcamUrl);
  }

  if (webcamUrl.includes("panomax.com")) {
    return extractWebcamFromPanomax(webcamUrl);
  }

  if (/.{5,255}\.jpg$/.test(webcamUrl)) {
    return {
      name: "",
      largeImage: webcamUrl,
      thumbnailImage: webcamUrl,
    };
  }

  return null;
};

const extractWebcamFromTrinumImage = (url: string) => {
  const name =
    url
      .split(/(mega_|small_)/)[2]
      .replaceAll(/[-_]/gi, " ")
      .replace(".jpg", "") || "";
  return {
    name,
    largeImage: url.replace("/small_", "/mega_"),
    thumbnailImage: url.replace("/mega_", "/small_"),
  };
};

const extractWebcamFromSkapingWebsite = async (
  url: string
): Promise<Webcam> => {
  try {
    const skapingPageResponse = await fetch(url);
    const skapingPageSource = await skapingPageResponse.text();

    const $ = cheerio.load(skapingPageSource);
    const script = ($("script").get()[0].children[0] as any).data;

    const skapingWebcamKeyMatches = script.match(
      /SkapingAPI\.setConfig\('http:\/\/api\.skaping\.com\/', '([a-zA-Z0-9-]+)'\);/
    );

    const skapingWebcamKey = [...skapingWebcamKeyMatches][1];

    return {
      name: $("title").text(),
      largeImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${skapingWebcamKey}&quality=large`,
      thumbnailImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${skapingWebcamKey}&quality=small`,
    };
  } catch (e) {
    console.log(e);
    return {
      name: "",
      largeImage: "",
      thumbnailImage: "",
    };
  }
};

const extractWebcamFromPanomax = async (url: string): Promise<Webcam> => {
  console.log(url);
  try {
    const panomaxPageResponse = await fetch(url);
    const panomaxPageSource = await panomaxPageResponse.text();

    const $ = cheerio.load(panomaxPageSource);
    const script = (
      $('script[type="text/javascript"][language="JavaScript"]').get()[0]
        .children[0] as any
    ).data;

    const panomaxWebcamIds = script.match(/var camId = "([0-9]+)";/);

    const panomaxWebcamId = [...panomaxWebcamIds][1];

    return {
      name: $("title").text(),
      largeImage: `https://live-image.panomax.com/cams/${panomaxWebcamId}/recent_reduced.jpg`,
      thumbnailImage: `https://live-image.panomax.com/cams/${panomaxWebcamId}/recent_reduced.jpg`,
    };
  } catch (e) {
    console.log(e);
    return {
      name: "",
      largeImage: "",
      thumbnailImage: "",
    };
  }
};

import { describe, expect, it, test } from "vitest";

import { detectWebcamType } from "../webcamService";

describe("", () => {
  it("detect simple webcam", async () => {
    expect(
      await detectWebcamType("https://cams.skilouise.com/cam2.jpg")
    ).toStrictEqual({
      name: "",
      largeImage: "https://cams.skilouise.com/cam2.jpg",
      thumbnailImage: "https://cams.skilouise.com/cam2.jpg",
    });
    expect(
      await detectWebcamType("https://www.skaping.com/chamrousse/la-croix")
    ).toStrictEqual({
      name: "Webcam - Chamrousse - La Croix",
      largeImage:
        "https://api.skaping.com/media/getLatest?format=jpg&api_key=bt72j-AvkWE-3i9rS-6n2Yp&quality=large",
      thumbnailImage:
        "https://api.skaping.com/media/getLatest?format=jpg&api_key=bt72j-AvkWE-3i9rS-6n2Yp&quality=small",
    });
  });

  test("detect Trinum webcam", async () => {
    expect(
      await detectWebcamType(
        "https://www.trinum.com/ibox/ftpcam/small_menuires_depart-tc-pointe-de-la-masse.jpg"
      )
    ).toStrictEqual({
      name: "menuires depart tc pointe de la masse",
      largeImage:
        "https://www.trinum.com/ibox/ftpcam/mega_menuires_depart-tc-pointe-de-la-masse.jpg",
      thumbnailImage:
        "https://www.trinum.com/ibox/ftpcam/small_menuires_depart-tc-pointe-de-la-masse.jpg",
    });
    expect(
      await detectWebcamType(
        "https://www.trinum.com/ibox/ftpcam/mega_menuires_depart-tc-pointe-de-la-masse.jpg"
      )
    ).toStrictEqual({
      name: "menuires depart tc pointe de la masse",
      largeImage:
        "https://www.trinum.com/ibox/ftpcam/mega_menuires_depart-tc-pointe-de-la-masse.jpg",
      thumbnailImage:
        "https://www.trinum.com/ibox/ftpcam/small_menuires_depart-tc-pointe-de-la-masse.jpg",
    });
  });

  test("detect Skaping webcam", async () => {
    expect(
      await detectWebcamType("https://www.skaping.com/chamrousse/la-croix")
    ).toStrictEqual({
      name: "Webcam - Chamrousse - La Croix",
      largeImage:
        "https://api.skaping.com/media/getLatest?format=jpg&api_key=bt72j-AvkWE-3i9rS-6n2Yp&quality=large",
      thumbnailImage:
        "https://api.skaping.com/media/getLatest?format=jpg&api_key=bt72j-AvkWE-3i9rS-6n2Yp&quality=small",
    });
  });
});

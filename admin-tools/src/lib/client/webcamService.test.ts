import { expect, test } from "vitest";

import { detectWebcamType } from "./webcamService";

test("detect simple webcam", () => {
  expect(detectWebcamType("https://cams.skilouise.com/cam2.jpg")).toStrictEqual(
    {
      name: "",
      largeImage: "https://cams.skilouise.com/cam2.jpg",
      thumbnailImage: "https://cams.skilouise.com/cam2.jpg",
    }
  );
});

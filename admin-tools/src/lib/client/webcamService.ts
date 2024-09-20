import Webcam from "@/domain/Webcam";

export const detectWebcamType = (webcamUrl: string): Webcam | null => {
  // https://www.trinum.com/ibox/ftpcam/mega_autrans-meaudre_depart-zipline-vercors-meaudre-alt.1300m.jpg

  // https://www.skaping.com/les2alpes/3400m
  // https://data.skaping.com/les-2-alpes/3400/2024/09/26/large/06-10.jpg
  // https://data.skaping.com/les-2-alpes/3400/2024/09/26/small/06-10.jpg

  if (/.*\.jpg$/.test(webcamUrl)) {
    return {
      name: "",
      largeImage: webcamUrl,
      thumbnailImage: webcamUrl,
    };
  }

  return null;
};

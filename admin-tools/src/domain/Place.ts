import Coordinates from "./Coordinates";
import Webcam from "./Webcam";

type Place = {
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  state: string;
  url: string;
  webcams: Webcam[];
};

export default Place;

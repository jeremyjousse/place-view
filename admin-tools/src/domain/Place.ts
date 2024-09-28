import Coordinates from "./Coordinates";
import Webcam from "./Webcam";

export class Place {
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  state: string;
  url: string;
  webcams: Webcam[];

  constructor(
    id: string,
    name: string,
    country: string,
    coordinates: Coordinates,
    state: string,
    url: string,
    webcams: Webcam[]
  ) {
    this.id = id;
    this.name = name;
    this.country = country;
    this.coordinates = coordinates;
    this.state = state;
    this.url = url;
    this.webcams = webcams;
  }

  public static empty() {
    return new Place("", "", "", { latitude: 0, longitude: 0 }, "", "", []);
  }

  public toDto(): PlaceDto {
    return {
      id: this.id,
      name: this.name,
      country: this.country,
      coordinates: this.coordinates,
      state: this.state,
      url: this.url,
      webcams: this.webcams,
    };
  }
}

export type PlaceDto = {
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  state: string;
  url: string;
  webcams: Webcam[];
};

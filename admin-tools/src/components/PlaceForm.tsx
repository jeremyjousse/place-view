"use client";

import * as z from "zod";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LocationPrediction,
  getLocationPrediction,
} from "@/lib/server/geocodeMapService";
import { Map, Marker } from "pigeon-maps";
import { placeDetail, updatePlace } from "@/lib/server/placeService";
import { useEffect, useState } from "react";

import Coordinates from "@/domain/Coordinates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Place from "@/domain/Place";
import { Trash2 } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type PlaceProps = {
  id: string;
};

const schema = z.object({
  name: z.string(),
  state: z.string(),
  country: z.string(),
  url: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

type Schema = z.infer<typeof schema>;

export default function PlaceForm(props: PlaceProps) {
  const [open, setOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [place, setPlace] = useState<Place>();
  const [placeName, setPlaceName] = useState<string>();
  const [predictions, setPredictions] = useState<LocationPrediction[]>();
  const debouncedSearchTerm = useDebounce(placeName, 1000);

  const { register, handleSubmit, setValue } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", state: "", country: "" },
  });

  const onSubmit = (data: Schema) => {
    console.log("onSubmit");
    console.log(data);
    console.log(place);
    ("use server");
    if (place) updatePlace(place);
  };

  const selectPrediction = (predictionId: string) => {
    const selectedPrediction = predictions?.find(
      (prediction) => prediction.displayName == predictionId
    );

    if (selectedPrediction) {
      setCoordinates({
        longitude: selectedPrediction.longitude,
        latitude: selectedPrediction.latitude,
      });
      setValue("latitude", selectedPrediction.latitude);
      setValue("longitude", selectedPrediction.longitude);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      getLocationPrediction(debouncedSearchTerm).then(setPredictions);
    } else {
      setPredictions([]);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    placeDetail(props.id).then((place) => {
      setPlace(place);
      if (place?.name) setValue("name", place?.name);
      if (place?.state) setValue("state", place?.state);
      if (place?.country) setValue("country", place?.country);
      if (place?.coordinates.latitude)
        setValue("latitude", place?.coordinates.latitude);
      if (place?.coordinates.longitude)
        setValue("longitude", place?.coordinates.longitude);
      if (place?.url) setValue("url", place?.url);

      if (place?.coordinates.latitude && place?.coordinates.longitude) {
        setCoordinates({
          longitude: place?.coordinates.longitude,
          latitude: place?.coordinates.latitude,
        });
      }
    });
  }, [props.id]);

  const handleDeleteWebcam = (largeImage: string) => {
    if (place) {
      const webcams = place.webcams.filter(
        (webcam) => webcam.largeImage != largeImage
      );

      setPlace({ ...place, webcams });
    }
  };

  return (
    <div>
      <Command className="rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput
          placeholder="Type a command or search..."
          onValueChange={setPlaceName}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {predictions?.map((prediction) => (
            <CommandItem
              key={prediction.displayName}
              value={prediction.displayName}
              onSelect={(prediction) => {
                selectPrediction(prediction);
                setOpen(false);
              }}
            >
              {prediction.displayName}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      {place ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-2xl">{place.id}</h1>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input {...register("name")} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input {...register("state")} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input {...register("country")} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input {...register("longitude")} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input {...register("latitude")} />
          </div>
          {coordinates ? (
            <Map
              height={300}
              center={[coordinates.latitude, coordinates.longitude]}
              defaultZoom={11}
            >
              <Marker
                width={50}
                anchor={[coordinates.latitude, coordinates.longitude]}
              />
            </Map>
          ) : (
            <></>
          )}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input {...register("url")} />
          </div>
          {/* TODO <ScrollArea /> https://ui.shadcn.com/docs/components/scroll-area */}
          {place?.webcams.map((webcam) => (
            <div key={webcam.name} className="max-w-sm m-2 flex">
              <a href={webcam.largeImage} target="_blank" className="inline">
                <img src={webcam.largeImage} className="inline w-80" />
              </a>
              <button
                onClick={() => handleDeleteWebcam(webcam.largeImage)}
                className="inline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="submit">Update</button>
        </form>
      ) : (
        <div>No place found</div>
      )}
    </div>
  );
}

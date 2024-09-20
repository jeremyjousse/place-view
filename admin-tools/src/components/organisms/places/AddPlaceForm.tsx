"use client";

import { CirclePlus, Trash2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Coordinates from "@/domain/Coordinates";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import Place from "@/domain/Place";
import Webcam from "@/domain/Webcam";
import { detectWebcamType } from "@/lib/client/webcamService";
import { placeIdFromName } from "@/lib/client/placeService";
import { updatePlace } from "@/lib/server/placeService";
import { useDebounce } from "@uidotdev/usehooks";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string(),
  state: z.string(),
  country: z.string(),
  url: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  webcams: z.array(
    z.object({
      name: z.string(),
      largeImage: z.string(),
      thumbnailImage: z.string(),
    })
  ),
  // TODO usefieldarray https://react-hook-form.com/docs/usefieldarray
});
type Schema = z.infer<typeof schema>;
const AddPlaceFrom = () => {
  const [open, setOpen] = useState(false);
  const [addWebcamStatus, setAddWebcamStatus] = useState(false);
  const [webcams, setWebcams] = useState<Webcam[]>([]);
  const [newWebcamUrl, setNewWebcamUrl] = useState("");
  const debouncedNewWebcamUrl = useDebounce(newWebcamUrl, 1000);
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [place, setPlace] = useState<Place>({
    id: "",
    name: "",
    country: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    state: "",
    url: "",
    webcams: [],
  });
  const [placeName, setPlaceName] = useState<string>();
  const [predictions, setPredictions] = useState<LocationPrediction[]>();
  const debouncedSearchTerm = useDebounce(placeName, 1000);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", state: "", country: "" },
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormProvider)
      name: "webcams",
    }
  );
  const watchWebcamsFieldArray = watch("webcams");
  const controlledWebcamsFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchWebcamsFieldArray[index],
    };
  });

  const selectPrediction = (predictionId: string) => {
    const selectedPrediction = predictions?.find(
      (prediction) => prediction.displayName == predictionId
    );

    if (selectedPrediction) {
      setCoordinates({
        longitude: selectedPrediction.longitude,
        latitude: selectedPrediction.latitude,
      });
      setValue("coordinates.latitude", selectedPrediction.latitude);
      setValue("coordinates.longitude", selectedPrediction.longitude);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      getLocationPrediction(debouncedSearchTerm).then(setPredictions);
    } else {
      setPredictions([]);
    }
  }, [debouncedSearchTerm]);

  const handleDeleteWebcam = (largeImage: string) => {
    // TODO attach to form values
    if (place) {
      const webcams = place.webcams.filter(
        (webcam) => webcam.largeImage != largeImage
      );

      setPlace({ ...place, webcams });
    }
  };

  const onSubmit = (data: Schema) => {
    ("use server");
    console.log("onSubmit");
    console.log(getValues());
    updatePlace({
      id: placeIdFromName(getValues("name")),
      ...getValues(),
      // webcams,
    });
  };

  const handleUpdateWebcamName = (index: number, name: string) => {
    setWebcams([
      ...webcams.map((actualWebcam, actualIndex) => {
        if (actualIndex == index) {
          actualWebcam.name = name;
        }
        return actualWebcam;
      }),
    ]);
  };

  useEffect(() => {
    console.log(debouncedNewWebcamUrl);
    const detectedWebcam = detectWebcamType(debouncedNewWebcamUrl);
    if (detectedWebcam) {
      console.log(detectedWebcam);
      setNewWebcamUrl("");
      setAddWebcamStatus(false);
      setValue("webcams", [...getValues("webcams"), detectedWebcam]);
      // setWebcams([...webcams, detectedWebcam]);
    }
  }, [debouncedNewWebcamUrl]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.coordinates?.latitude?.message}
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
        <Input
          {...register("coordinates.longitude", {
            setValueAs: (value) => Number(value),
          })}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          {...register("coordinates.latitude", {
            setValueAs: (value) => Number(value),
          })}
        />
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
      {addWebcamStatus ? (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="url">New webcam</Label>
          <Input
            value={newWebcamUrl}
            onChange={(event) => setNewWebcamUrl(event.target.value)}
          />
        </div>
      ) : (
        <div>
          <button onClick={() => setAddWebcamStatus(true)}>
            <CirclePlus />
          </button>
        </div>
      )}
      {webcams.map((webcam, index) => (
        <div key={webcam.name} className="max-w-sm m-2 flex">
          <Input
            value={webcam.name}
            onChange={(event) =>
              handleUpdateWebcamName(index, event.target.value)
            }
          />
          <a href={webcam.largeImage} target="_blank" className="inline">
            <img src={webcam.largeImage} className="inline w-80" alt="" />
          </a>
          <button
            onClick={() => handleDeleteWebcam(webcam.largeImage)}
            className="inline"
          >
            <Trash2 className="mr-2 h-4 w-4" />
          </button>
        </div>
      ))}

      {controlledWebcamsFields.map((field, index) => (
        <div key={index}>
          <Input
            key={`name-${field.id}`}
            {...register(`webcams.${index}.name`)}
          />
          <Input
            key={`large-${field.id}`}
            {...register(`webcams.${index}.largeImage`)}
          />
          <Input
            key={`thumb-${field.id}`}
            {...register(`webcams.${index}.thumbnailImage`)}
          />
        </div>
      ))}
      <button type="submit">Update</button>
    </form>
  );
};

export default AddPlaceFrom;

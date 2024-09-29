"use client";

import { Map, Marker } from "pigeon-maps";
import { redirect, useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

import Coordinates from "@/domain/Coordinates";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { PlaceDto } from "@/domain/Place";
import PlaceNameInput from "../molecules/PlaceNameInput";
import { Trash2 } from "lucide-react";
import Webcam from "@/domain/Webcam";
import WebcamAddInput from "@/components/molecules/WebcamAddInput";
import { placeIdFromName } from "@/lib/client/placeService";
import { updatePlace } from "@/lib/server/placeService";
import { useState } from "react";
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
});
type Schema = z.infer<typeof schema>;
const AddPlaceFrom = ({ place }: { place: PlaceDto }) => {
  const router = useRouter();
  const [webcams, setWebcams] = useState<Webcam[]>([]);

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
    defaultValues: {
      name: place.name,
      state: place.state,
      country: place.country,
      coordinates: {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
      },
      url: place.url,
      webcams: place.webcams,
    },
  });

  const coordinates = watch("coordinates");

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
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

  const setNameAndCoordinates = (
    name: string,
    coordinates: Coordinates
  ): void => {
    setValue("name", name);
    setValue("coordinates.latitude", coordinates.latitude);
    setValue("coordinates.longitude", coordinates.longitude);
  };

  const handleDeleteWebcam = (largeImage: string) => {
    // TODO attach to form values
    if (place) {
      const webcams = place.webcams.filter(
        (webcam) => webcam.largeImage != largeImage
      );
    }
  };

  const addWebcam = (webcam: Webcam): void => {
    setValue("webcams", [...getValues("webcams"), webcam]);
  };

  const onSubmit = (data: Schema) => {
    ("use server");
    updatePlace({
      id: placeIdFromName(getValues("name")),
      ...getValues(),
    });
    router.push("/");
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PlaceNameInput setNameAndCoordinates={setNameAndCoordinates} />
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
      {watch("coordinates") &&
      watch("coordinates.latitude") != 0 &&
      watch("coordinates.longitude") != 0 ? (
        <Map
          height={300}
          center={[
            watch("coordinates.latitude"),
            watch("coordinates.longitude"),
          ]}
          defaultZoom={11}
        >
          <Marker
            width={50}
            anchor={[
              watch("coordinates.latitude"),
              watch("coordinates.longitude"),
            ]}
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
      <WebcamAddInput addWebcam={addWebcam} />

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

      {/* TODO Add remove webcam button */}
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

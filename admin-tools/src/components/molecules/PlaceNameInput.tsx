import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import {
  LocationPrediction,
  getLocationPrediction,
} from "@/lib/server/geocodeMapService";
import { useEffect, useState } from "react";

import Coordinates from "@/domain/Coordinates";
import { useDebounce } from "@uidotdev/usehooks";

const PlaceNameInput = ({
  setNameAndCoordinates,
}: {
  setNameAndCoordinates: (name: string, coordinates: Coordinates) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [placeName, setPlaceName] = useState<string>();
  const [predictions, setPredictions] = useState<LocationPrediction[]>([]);
  const debouncedSearchTerm = useDebounce(placeName, 1000);

  const selectPrediction = (predictionId: string) => {
    console.log(predictionId);
    const selectedPrediction = predictions?.find(
      (prediction) => prediction.displayName == predictionId
    );

    console.log(selectedPrediction);

    if (selectedPrediction) {
      setNameAndCoordinates(selectedPrediction.displayName, {
        longitude: selectedPrediction.longitude,
        latitude: selectedPrediction.latitude,
      });
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 0) {
      getLocationPrediction(debouncedSearchTerm).then(setPredictions);
      setOpen(true);
    } else {
      setOpen(false);
      setPredictions([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput
        placeholder="Type a place name to search"
        onValueChange={setPlaceName}
      />

      <CommandList hidden={!open} style={{ zIndex: 5 }}>
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
  );
};

export default PlaceNameInput;

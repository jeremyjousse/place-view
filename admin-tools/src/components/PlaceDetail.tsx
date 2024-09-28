import { Map, Marker } from "pigeon-maps";
import { useEffect, useState } from "react";

import Link from "next/link";
import PlaceDto from "@/domain/Place";
import React from "react";
import { placeDetail } from "@/lib/server/placeService";

type PlaceProps = {
  id: string;
};

export default function PlaceComponent(props: PlaceProps) {
  const [place, setPlace] = useState<PlaceDto>();

  useEffect(() => {
    placeDetail(props.id).then((place) => {
      setPlace(place);
    });
  }, [props.id]);

  return (
    <div>
      {place ? (
        <div>
          <h1>{place.name}</h1>
          {place.country} - {place.state}
          <br />
          {place.coordinates.longitude} - {place.coordinates.latitude}
          <br />
          <Map
            height={300}
            defaultCenter={[
              place.coordinates.latitude,
              place.coordinates.longitude,
            ]}
            defaultZoom={11}
          >
            <Marker
              width={50}
              anchor={[place.coordinates.latitude, place.coordinates.longitude]}
            />
          </Map>
          <br />
          <Link href={place.url} target="_blank">
            {place.url}
          </Link>
          <br />
          {place.webcams.map((webcam) => (
            <Link
              href={webcam.largeImage}
              target="_blank"
              key={webcam.thumbnailImage}
            >
              <picture>
                <img
                  alt={webcam.name}
                  src={webcam.largeImage}
                  width="400"
                  style={{ display: "block", marginBottom: "20px" }}
                />
              </picture>
            </Link>
          ))}
        </div>
      ) : (
        <div>No place found</div>
      )}
    </div>
  );
}

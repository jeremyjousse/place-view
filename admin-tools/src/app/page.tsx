"use client";

import BadWebcams from "@/components/BabWebcams";
import PlacesComponent from "@/components/PlacesComponent";

export default function Home() {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
      <PlacesComponent />
      <BadWebcams />{" "}
    </div>
  );
}

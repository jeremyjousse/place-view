"use client";

import PlaceForm from "@/components/organisms/PlaceForm";
import { placeDetail } from "@/lib/server/placeService";
import { useParams } from "next/navigation";

const EditPlacePage = async () => {
  const params = useParams<{ id: string }>();
  const place = await placeDetail(params.id);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <PlaceForm place={place} />
      </main>
    </div>
  );
};

export default EditPlacePage;

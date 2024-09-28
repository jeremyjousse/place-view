import AddPlaceFrom from "@/components/organisms/PlaceForm";
import { Place } from "@/domain/Place";

const AddWebcam = () => {
  const place = Place.empty().toDto();
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <AddPlaceFrom place={place} />
      </main>
    </div>
  );
};

export default AddWebcam;

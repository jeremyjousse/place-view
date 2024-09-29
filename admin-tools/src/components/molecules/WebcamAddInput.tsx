import { useEffect, useState } from "react";

import { CirclePlus } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import Webcam from "@/domain/Webcam";
import { detectWebcamType } from "@/lib/server/webcamService";
import { useDebounce } from "@uidotdev/usehooks";

const WebcamAddInput = ({
  addWebcam,
}: {
  addWebcam: (webcam: Webcam) => void;
}) => {
  const [addWebcamStatus, setAddWebcamStatus] = useState(false);
  const [newWebcamUrl, setNewWebcamUrl] = useState("");
  const debouncedNewWebcamUrl = useDebounce(newWebcamUrl, 1000);

  useEffect(() => {
    detectWebcamType(debouncedNewWebcamUrl).then((detectedWebcam) => {
      if (detectedWebcam) {
        console.log(detectedWebcam);
        setNewWebcamUrl("");
        setAddWebcamStatus(false);
        addWebcam(detectedWebcam);
      }
    });
  }, [debouncedNewWebcamUrl]);
  return (
    <>
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
    </>
  );
};

export default WebcamAddInput;

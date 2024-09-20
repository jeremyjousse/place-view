"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Webcam, listBadWebcams } from "@/lib/server/webcamImageScanner";
import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

export default function BadWebcams() {
  let [badWebcams, setBadWebcams] = useState([] as Webcam[]);

  useEffect(() => {
    listBadWebcams().then((badWebcams) => setBadWebcams(badWebcams));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Bad webcams</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {badWebcams.map((badWebcam) => (
          <div key={badWebcam.largeImage}>
            <Link target="_blank" href={badWebcam.largeImage}>
              {badWebcam.largeImage}
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

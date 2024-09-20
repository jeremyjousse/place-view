"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import Link from "next/link";
import Place from "@/domain/Place";
import { listPlaces } from "@/lib/server/placeService";

export default function PlacesComponent() {
  let [places, setPlaces] = useState([] as Place[]);

  useEffect(() => {
    listPlaces().then((places) => setPlaces(places));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>PLace List</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Place</TableHead>
              <TableHead>Webcams</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.map((place) => (
              <TableRow key={place.id}>
                <TableCell className="font-medium">
                  <Link href={`/places/${place.id}`}>{place.name}</Link>
                </TableCell>
                <TableCell>{place.webcams.length}</TableCell>
                <TableCell>
                  <Button>
                    <Link href={`/places/${place.id}/edit`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { PiMapResponse } from "@/services/rasberry-pi";
import React from "react";

const googleMapKey = process.env.GOOGLE_API;

export default function MapMessage(props: PiMapResponse) {
  const { longitude, latitude } = props;
  const src = `https://www.google.com/maps/embed/v1/place?key=${googleMapKey}&q=${latitude},${longitude}`;
  return (
    <iframe
      className="h-96  p-1 rounded-md"
      width="100%"
      src={src}
      loading="lazy"
    ></iframe>
  );
}

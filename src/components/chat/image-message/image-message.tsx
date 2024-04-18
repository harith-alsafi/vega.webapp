/* eslint-disable @next/next/no-img-element */
import React from "react";

export interface ImageMessageProps {
  src: string;
}

export default function ImageMessage({ src }: ImageMessageProps) {
  return (
    <img
      src={src}
      alt="Image raspberry pi"
      className="object-cover object-center h-full w-full"
    />
  );
}

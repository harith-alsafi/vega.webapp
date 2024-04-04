/* eslint-disable @next/next/no-img-element */
import React from "react";
import CollapsableMessage from "../messages/collapsable-message";

export interface ImageMessageProps {
  src: string;
}

export default function ImageMessage(props: ImageMessageProps) {
  const { src } = props;
  return (
    <CollapsableMessage title="Raspberry Pi Image">
      <img
        src={src}
        alt="Image raspberry pi"
        className="object-cover object-center h-full w-full"
      />
    </CollapsableMessage>
  );
}

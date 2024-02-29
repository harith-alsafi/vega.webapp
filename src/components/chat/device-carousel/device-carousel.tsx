import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DeviceCard from "./device-card";
import { PiDeviceInfo } from "@/services/rasberry-pi";
import CollapsableMessage from "@/components/chat/messages/collapsable-message";

export default function DeviceCarousel({
  devices,
}: {
  devices: PiDeviceInfo[];
}) {
  return (
    <CollapsableMessage title="Current Devices">
      <div className="flex justify-center items-center">
        <Carousel className="max-w-xs">
          <CarouselContent>
            {devices.map((device, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <DeviceCard device={device} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </CollapsableMessage>
  );
}

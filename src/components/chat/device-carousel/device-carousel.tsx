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
        <Carousel className="max-w-[15rem] sm:max-w-[20rem] md:max-w-[20rem] lg:max-w-[20rem] xl:max-w-[20rem]">
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

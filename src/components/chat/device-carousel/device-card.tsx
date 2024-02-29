import { PiDeviceInfo } from "@/services/rasberry-pi";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PiWaveSquareFill } from "react-icons/pi";
import { PiNumberZeroFill } from "react-icons/pi";
import { PiWavesFill } from "react-icons/pi";
import { PiCircuitryFill } from "react-icons/pi";
import { MdOutput } from "react-icons/md";
import { MdInput } from "react-icons/md";
import { FaMicrochip } from "react-icons/fa";
import { MdDataThresholding } from "react-icons/md";
import { PiPlugsConnectedFill } from "react-icons/pi";
import { VscDebugDisconnect } from "react-icons/vsc";

export default function DeviceCard({ device }: { device: PiDeviceInfo }) {
  const {
    name,
    description,
    value,
    frequency,
    pins,
    type,
    hasData,
    isInput,
    isConnected,
  } = device;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex">
            <p className="mt-[0.12rem] mr-2">{name}</p>
            <div className="grow" />
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              {type === "analog" ? (
                <>
                  <PiWavesFill className="mr-1 h-5 w-5" />
                  {"Analog"}
                </>
              ) : type === "digital" ? (
                <>
                  <PiNumberZeroFill className="mr-1 h-5 w-5" />
                  {"Digital"}
                </>
              ) : type === "pwm" ? (
                <>
                  <PiWaveSquareFill className="mr-1 h-5 w-5" />
                  {"PWM"}
                </>
              ) : (
                <>
                  <PiCircuitryFill className="mr-1 h-5 w-5" />
                  {"I2C"}
                </>
              )}
            </div>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="-mt-3">
        <div className="flex items-center text-center content-center">
          <p className="grow mb-4 p-1 text-2xl font-bold bg-primary text-primary-foreground shadow rounded-md whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            {value}
          </p>
          {frequency ? (
            <p className="ml-1 mb-4 py-1 px-3 text-2xl font-bold bg-slate-700 text-white text-primary-foreground shadow rounded-md whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              {frequency + " Hz"}
            </p>
          ) : null}
        </div>
        <Separator className="mb-2" />
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <FaMicrochip className="mr-1 h-4 w-4" />
            {" ["}
            {pins.join(", ")}
            {"]"}
          </div>
          <div className="grow"></div>
          <div className="flex items-center">
            {hasData ? <MdDataThresholding className="mr-1 h-5 w-5" /> : null}
            {isInput ? (
              <MdInput className="mr-1 h-5 w-5" />
            ) : (
              <MdOutput className="mr-1 h-5 w-5" />
            )}
            {isConnected ? (
              <PiPlugsConnectedFill className="mr-1 h-5 w-5" />
            ) : (
              <VscDebugDisconnect className="mr-1 h-5 w-5" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

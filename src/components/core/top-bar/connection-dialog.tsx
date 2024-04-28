"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { ring } from "ldrs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useConnectionContext } from "@/lib/context/connection-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConnectRaspberryPi, PingRaspberryPi } from "@/services/rasberry-pi";
import { toast } from "sonner";

ring.register();

const formSchema = z.object({
  ip: z.string().refine(
    (value) => {
      // Use a regular expression to check if the value is a valid IP address
      const ipAddressRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipAddressRegex.test(value);
    },
    {
      message: "Invalid IP address format",
    }
  ),
  port: z.coerce
    .number()
    .int({ message: "Port must be a number" })
    .min(0, { message: "Port must be a positive number" })
    .max(65535, { message: "Port must be less than 65535" }),
});

export default function ConnectionDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const { connectionState, setConnectionState } = useConnectionContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ip: connectionState.ip,
      port: connectionState.port,
    },
  });
  let periodicCheck: NodeJS.Timeout | undefined = undefined;
  useEffect(() => {
    form.setValue("ip", connectionState.ip);
    form.setValue("port", connectionState.port);
  }, [connectionState, form]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const piConnection = await ConnectRaspberryPi(values.ip, values.port);
      setConnectionState({
        ip: piConnection.ip,
        port: piConnection.port,
        url: piConnection.url,
        devices: piConnection.devices,
        tools: piConnection.tools,
        id: piConnection.id,
        status: piConnection.status,
      });

      toast.success("Connection successful", {
        description: "Managed to connect to Raspberry Pi with IP " + values.ip,
      });
      // if (periodicCheck) {
      //   clearInterval(periodicCheck);
      // }
      // periodicCheck = setInterval(async () => {
      //   const pinged = await PingRaspberryPi(
      //     connectionState.ip,
      //     connectionState.port
      //   );
      //   if (!pinged) {
      //     setConnectionState({
      //       ip: connectionState.ip,
      //       port: connectionState.port,
      //       url: connectionState.url,
      //       devices: connectionState.devices,
      //       tools: connectionState.tools,
      //       id: connectionState.id,
      //       status: false,
      //     });
      //   }
      // }, 15000);
    } catch (error) {
      if (error instanceof Error) {
        form.setError("root", {
          message: "Couldn't connect to Pi with IP " + values.ip,
        });
        toast.error("Connection failed", {
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative h-9 justify-start  bg-background text-sm font-normal shadow-none w-40 lg:w-44"
        >
          <span className="relative flex h-3 w-3 mr-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                connectionState.status ? "bg-sky-400" : "bg-red-400"
              } opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                connectionState.status ? "bg-sky-500" : "bg-red-500"
              } `}
            ></span>
          </span>
          {connectionState.ip}
          <div className="absolute right-[0.3rem] top-[0.42rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Pencil1Icon className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[445px]">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
          <DialogDescription>
            Edit current connection here. Click connect when youre done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ip Address</FormLabel>
                  <FormControl>
                    <Input
                      // placeholder={`Ex: ${DefaultPiConnection.ip}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      // placeholder={`Ex: ${DefaultPiConnection.port}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                disabled={!isLoading}
                onClick={() => setIsLoading(false)}
              >
                Stop
              </Button>
              <Button
                type="submit"
                // onClick={() => setIsLoading(true)}
                disabled={isLoading}
              >
                Connect
                {isLoading && (
                  <div className="ml-2 mt-1">
                    <l-ring
                      size="20"
                      stroke="2"
                      bg-opacity="0"
                      speed="2"
                      color="black"
                    ></l-ring>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

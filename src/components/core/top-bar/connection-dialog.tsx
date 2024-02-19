"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AvatarIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useConnectionContext } from "@/lib/context/connection-context";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ConnectRaspberryPi,
  DefaultPiConnection,
} from "@/services/rasberry-pi";
import { Avatar } from "@radix-ui/react-avatar";
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
  url: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch (error) {
          return false;
        }
      },
      {
        message: "Invalid URL format",
      }
    ),
});

export default function ConnectionDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const { connectionState, setConnectionState } = useConnectionContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ip: connectionState.ip,
      port: connectionState.port,
      url: connectionState.url,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const piConnection = await ConnectRaspberryPi(
        values.ip,
        values.port,
        values.url
      );
      // setConnectionState(piConnection)
      setConnectionState({
        ip: piConnection.ip,
        port: piConnection.port,
        url: piConnection.url,
        components: piConnection.components,
        tools: piConnection.tools,
        id: piConnection.id,
        status: !connectionState.status,
      });

      toast.success("Connection successful", {
        description: "Managed to connect to Raspberry Pi with IP " + values.ip,
      });
    } catch (error) {
      if (error instanceof Error) {
        form.setError("root", { message: "Connection failed" });
        toast.error("Connection failed", {
          description:
            "Did not manage to connect to Raspberry Pi with IP " + values.ip,
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
          className="relative h-8 justify-start  bg-background text-sm font-normal shadow-none w-48"
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
          <div className="absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Pencil1Icon className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[445px]">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
          <DialogDescription>
            Edit current connection here. Click save when youre done.
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
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Url</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      // placeholder={`Ex: ${DefaultPiConnection.url}`}
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

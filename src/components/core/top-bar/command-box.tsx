"use client";
import * as React from "react";
import { DialogProps } from "@radix-ui/react-alert-dialog";
import {
  BoxModelIcon,
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConnectionContext } from "@/lib/context/connection-context";
import {
  PiDeviceInfo,
  PiInfo,
  PiToolInfo,
  ToolType,
} from "@/services/rasberry-pi";
import FunctionIcon from "@/icons/FunctionIcon";

export function ToolCard({ tool }: { tool: ToolType }) {
  return (
    <div className="flex items-center">
      {tool.name}
    </div>
  );
}

export function DeviceCard({ device }: { device: PiDeviceInfo }) {
  return (
    <div className="flex items-center">
      {device.name}
    </div>
  );
}

export function CommandCard({ item }: { item: PiInfo }) {
  if ("parameters" in item) {
    return <ToolCard tool={item} />;
  }
  if ("pins" in item) {
    return <DeviceCard device={item} />;
  }
  return null;
}

export function CommandBox({ ...props }: DialogProps) {
  const [open, setOpen] = React.useState(false);
  const { connectionState } = useConnectionContext();
  const [selectedItem, setSelectedItem] = React.useState<PiInfo | undefined>(
    undefined
  );
  const [value, setValue] = React.useState("");
  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <MagnifyingGlassIcon className="h-4 w-4" />
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command value={value} onValueChange={(v) => {
          setValue(v)
          const isTool = connectionState?.tools.find((tool) => tool.name === v)
          if (isTool) {
            setSelectedItem(isTool)
            return
          }
          const isDevice = connectionState?.devices.find((device) => device.name === v)
          if (isDevice) {
            setSelectedItem(isDevice)
          }
        }}>
          <CommandInput autoFocus placeholder="Search through everything..." />
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={40}>
              <CommandList
                className="mr-[0.1rem]"
                style={{
                  WebkitOverflowScrolling: "touch", // Enables momentum scrolling in iOS
                  scrollbarWidth: "thin", // For Firefox
                  scrollbarColor: "transparent transparent", // For Firefox
                }}
              >
                <ScrollArea className="h-72 rounded-md pr-3 pl-3 mt-1 mb-1">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup  heading="Tools">
                    {connectionState?.tools.map((tool) => (
                      <CommandItem
                        className="flex items-center"
                        onSelect={() =>{
                          console.log("focused")
                        }}
                        value={tool.name}
                        key={tool.name} 
                      >
                        <div className="mr-2" onSelect={() => {
                          console.log("focused")
                        }}>
                          <FunctionIcon />
                        </div>
                        {tool.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Devices">
                    {connectionState?.devices.map((device) => (
                      <CommandItem
                        
                        className=""
                        onSelect={() =>{
                          
                        }}
                        
                        value={device.name}
                        key={device.name}
                      >
                        <BoxModelIcon className="w-4 h-4 mr-2" />
                        {device.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              {selectedItem && <span>{selectedItem.name}</span>}
            </ResizablePanel>
          </ResizablePanelGroup>
        </Command>
      </CommandDialog>
    </>
  );
}

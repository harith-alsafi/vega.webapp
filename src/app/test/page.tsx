// "use client";

import Image from "next/image";
// import {
//   Menubar,
//   MenubarCheckboxItem,
//   MenubarContent,
//   MenubarItem,
//   MenubarMenu,
//   MenubarRadioGroup,
//   MenubarRadioItem,
//   MenubarSeparator,
//   MenubarShortcut,
//   MenubarSub,
//   MenubarSubContent,
//   MenubarSubTrigger,
//   MenubarTrigger,
// } from "@/components/ui/menubar";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { TabsPanel } from "@/components/core/top-bar/tabs-panel";

import Visualizer from "next-route-visualizer";
import CollapsableMessage from "@/components/chat/messages/collapsable-message";
import DeviceCarousel from "@/components/chat/device-carousel/device-carousel";
import { useConnectionContext } from "@/lib/context/connection-context";
import { DevicesExample } from "@/services/rasberry-pi";
// import FlowChart, {
//   GptResultExample,
// } from "@/components/chat/flows/flow-chart";
// import PlotMessage, {
//   PlotMessagesExample,
// } from "@/components/chat/plots/plot-message";
// import { ConnectionSelector } from "@/components/core/top-bar/connection-selector";
// import {
//   CartesianGrid,
//   Legend,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Scatter,
//   ScatterChart,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ZAxis,
// } from "recharts";
// import { ScatterCustomizedShape } from "recharts/types/cartesian/Scatter";
// import { Card } from "@/components/ui/card";

export function MenuTest() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Connection</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Edit...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Profile...</MenubarItem>
          <MenubarItem>{/* <ThemeToggle /> */}</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <ConnectionSelector />
      <TabsPanel />
    </Menubar>
  );
}

export function FlowTest() {
  return (
    <div style={{ width: "100vw", height: "92vh" }}>
      {" "}
      <FlowChart
        nodes={GptResultExample.nodes}
        edges={GptResultExample.edges}
      />{" "}
    </div>
  );
}

export function PlotTest() {
  return <PlotMessage {...PlotMessagesExample} />;
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface DataSeries {
  name: string;
  data: DataPoint[];
  fill: string;
  shape?: ScatterCustomizedShape;
}

export interface DataPlot {
  title: string;
  data: DataSeries[];
  xLabel: string;
  yLabel: string;
}

export function PlotTest2() {
  const data = [
    {
      name: "Sensor 1",
      data: [
        { name: "Sensor 1", x: 2, y: 1 },
        { name: "Sensor 1", x: 3, y: 2 },
        { name: "Sensor 1", x: 4, y: 3 },
        { name: "Sensor 1", x: 4.25, y: 3 },
        { name: "Sensor 1", x: 5, y: 4 },
        { name: "Sensor 1", x: 6, y: 5 },
      ],
      fill: "#82ca9d",
    },
    {
      name: "Sensor 2",
      data: [
        { name: "Sensor 2", x: 2, y: 5 },
        { name: "Sensor 2", x: 3, y: 9 },
        { name: "Sensor 2", x: 4, y: 1 },
        { name: "Sensor 2", x: 5, y: 2 },
        { name: "Sensor 2", x: 10, y: 4 },
      ],
      fill: "#8884d8",
    },
  ];

  const sortedData = data.map((sensor) => ({
    ...sensor,
    data: [...sensor.data].sort((a, b) => a.x - b.x),
  }));

  const maxTickCount = Math.max(...data.map((series) => series.data.length));

  return (
    <LineChart
      width={600}
      height={320}
      data={sortedData}
      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
    >
      <CartesianGrid stroke="#4d4d4d" strokeDasharray="5 5" />
      <XAxis
        dataKey="x"
        domain={["dataMin", "dataMax"]}
        tickCount={maxTickCount}
        type="number"
        label={{ value: "x-axis", position: "insideBottomMiddle", dy: 14 }}
      />
      <YAxis
        dataKey="y"
        label={{
          value: "y-axis",
          dx: 15,
          angle: -90,
          position: "insideLeft",
        }}
      />
      <Tooltip
        labelFormatter={() => ""}
        content={({ payload }) => {
          if (payload && payload.length > 0) {
            const sensor = payload[0].payload;
            return (
              <Card className="p-2">
                <p className="text-sm font-medium leading-none">
                  {sensor.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {`x: ${sensor.x}, y: ${sensor.y}`}
                </p>
              </Card>
            );
          }
          return null;
        }}
      />
      <Legend
        wrapperStyle={{ marginRight: "-10px" }}
        align="right"
        verticalAlign="top"
        layout="vertical"
      />
      {sortedData.map((sensor, index) => (
        <Line
          // strokeWidth={2}
          key={index}
          type="monotone"
          dataKey="y"
          data={sensor.data}
          name={sensor.name}
          stroke={sensor.fill}
          dot={{ cursor: "pointer" }}
        />
      ))}
    </LineChart>
  );
}

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import {
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { forwardRef, useImperativeHandle, useState } from "react";

// import { ReloadIcon } from "@radix-ui/react-icons";

// import { ping } from "ldrs";

// ping.register();

// // Default values shown
// import { ring } from "ldrs";

// ring.register();

// Default values shown

export function DialogDemo() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Connection</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[445px]">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
          <DialogDescription>
            Edit current connection here. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">IP</Label>
              <Input id="ip" placeholder="IP of the raspberry Pi" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Port</Label>
              <Input id="port" placeholder="Port of the raspberry Pi" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Port</Label>
              <Input id="port" placeholder="Port of the raspberry Pi" />
            </div>
          </div>
        </form>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setIsLoading(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsLoading(true)} disabled={isLoading}>
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
      </DialogContent>
    </Dialog>
  );
}


export default function Home() {
  return <DeviceCarousel devices={DevicesExample}/>
  return <Visualizer />
  return <FlowTest/>
  // return <PlotTest />
  // return <MenuTest />
  // return <PlotTest2 />;
  // return <DialogDemo />;
  // return <TipTap />
  // return <MentionExample />

  // return <TestNovel />
  // return <TextArea />
}

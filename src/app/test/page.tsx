"use client";

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

// import Visualizer from "next-route-visualizer";
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

import { ScatterChart, Scatter, ReferenceArea, XAxis, YAxis, Line, LineChart } from "recharts";
import React, { useState } from "react";

const data = [
  { x: 50, y: 200 },
  { x: 70, y: 100 },
  { x: 140, y: 250 },
  { x: 150, y: 400 },
  { x: 170, y: 300 },
];
const MIN_ZOOM = 5; // adjust based on your data
const DEFAULT_ZOOM = { x1: null, y1: null, x2: null, y2: null };
import "./index.css";
import PlotMessage, { PlotMessagesExample } from "@/components/chat/plots/plot-message";

export function PlotZoom(){
 // data currently on the plot
 const [filteredData, setFilteredData] = useState(data);

 // zoom coordinates
 const [zoomArea, setZoomArea] = useState(DEFAULT_ZOOM);
 // flag if currently zooming (press and drag)
 const [isZooming, setIsZooming] = useState(false);
 // flag if zoomed in
 const isZoomed = filteredData?.length !== data?.length;

 // flag to show the zooming area (ReferenceArea)
 const showZoomBox =
   isZooming &&
   !(Math.abs(zoomArea.x1 - zoomArea.x2) < MIN_ZOOM) &&
   !(Math.abs(zoomArea.y1 - zoomArea.y2) < MIN_ZOOM);

 // reset the states on zoom out
 function handleZoomOut() {
   setFilteredData(data);
   setZoomArea(DEFAULT_ZOOM);
 }

 /**
  * Two possible events:
  * 1. Clicking on a dot(data point) to select
  * 2. Clicking on the plot to start zooming
  */
 function handleMouseDown(e, offset) {
   setIsZooming(true);
   console.log(e)
   
   const { chartX, chartY, activePayload, activeCoordinates } = e || {};
   const {SyntheticEvent, nativeEvent} = offset || {};
    console.log(nativeEvent)
   console.log("chartX", chartX, "chartY", chartY, "activePayload", activePayload);

  const {offsetX, offsetY} = nativeEvent || {};
  console.log("offsetX", offsetX, "offsetY", offsetY);
  const xValue = activePayload[0] && activePayload[0].payload.x;
    const yValue = activePayload[0] && activePayload[0].payload.y;
    setZoomArea({ x1: chartX-offsetX, y1: chartY-offsetY, x2: chartX-offsetX, y2: chartY -offsetY});
   
 }

 // Update zoom end coordinates
 function handleMouseMove(e, offset) {
   if (isZooming) {
     // console.log("zoom selecting");
     const { chartX, chartY, activePayload } = e || {};
   const {offsetX, offsetY} = offset || {};

     const xValue = activePayload[0] && activePayload[0].payload.x;
     const yValue = activePayload[0] && activePayload[0].payload.y;

     
     setZoomArea((prev) => ({ ...prev, x2: chartX-offsetX, y2: chartY-offsetY }));
   }
 }

 // When zooming stops, update with filtered data points
 // Ignore if not enough zoom
 function handleMouseUp(e) {
   if (isZooming) {
     setIsZooming(false);
     let { x1, y1, x2, y2 } = zoomArea;

     // ensure x1 <= x2 and y1 <= y2
     if (x1 > x2) [x1, x2] = [x2, x1];
     if (y1 > y2) [y1, y2] = [y2, y1];

     if (x2 - x1 < MIN_ZOOM || y2 - y1 < MIN_ZOOM) {
       // console.log("zoom cancel");
     } else {
       // console.log("zoom stop");
       const dataPointsInRange = filteredData.filter(
         (d) => d.x >= x1 && d.x <= x2 && d.y >= y1 && d.y <= y2
       );
       setFilteredData(dataPointsInRange);
       setZoomArea(DEFAULT_ZOOM);
     }
   }
 }
 console.log(zoomArea)
 return (
   <div className="plot-container">
     {isZoomed && <button onClick={handleZoomOut}>Zoom Out</button>}
     <LineChart
       width={400}
       height={400}
       margin={{ top: 50 }}
       onMouseDown={handleMouseDown}
       onMouseMove={handleMouseMove}
       onMouseUp={handleMouseUp}
     >
       <XAxis
        // allowDataOverflow
         type="number"
         dataKey="x"
         domain={["dataMin - 20", "dataMax + 20"]}
       />
       <YAxis
        // allowDataOverflow
         type="number"
         dataKey="y"
         domain={["dataMin - 50", "dataMax + 50"]}
       />
           <Line
        dataKey="y"
         data={data}
         animationDuration={300}
       />
       {showZoomBox && (
         <ReferenceArea

           x1={zoomArea?.x1}
           x2={zoomArea?.x2}
           y1={zoomArea?.y1}
           y2={zoomArea?.y2}
         />
       )}
   
     </LineChart>
   </div>
 );
}

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
  // return <DataPlotUi/>
  // return <MapMessage latitude="18.5495" longitude="73.7916"/>
  // return <PlotZoom  />
  return <PlotMessage {...PlotMessagesExample} />;

  // return <DeviceCarousel devices={DevicesExample}/>
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

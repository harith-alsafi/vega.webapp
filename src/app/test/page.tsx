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
import CollapsableMessage, {
  CollapsableContainer,
} from "@/components/chat/messages/collapsable-message";
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
    <CollapsableContainer title="Gpt Flow Chart">
      <FlowChart
        nodes={GptResultExample.nodes}
        edges={GptResultExample.edges}
      />{" "}
    </CollapsableContainer>
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

import {
  ScatterChart,
  Scatter,
  ReferenceArea,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
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
import PlotMessage, {
  PlotMessagesExample,
} from "@/components/chat/plots/plot-message";
import MapMessage from "@/components/chat/map/map-message";
import Visualizer from "next-route-visualizer";
import FlowChart, {
  GptResultExample,
} from "@/components/chat/flows/flow-chart";
import { Message, MessageToolCallResponse } from "@/services/chat-completion";

export function PlotZoom() {
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
    console.log(e);

    const { chartX, chartY, activePayload, activeCoordinates } = e || {};
    const { SyntheticEvent, nativeEvent } = offset || {};
    console.log(nativeEvent);
    console.log(
      "chartX",
      chartX,
      "chartY",
      chartY,
      "activePayload",
      activePayload
    );

    const { offsetX, offsetY } = nativeEvent || {};
    console.log("offsetX", offsetX, "offsetY", offsetY);
    const xValue = activePayload[0] && activePayload[0].payload.x;
    const yValue = activePayload[0] && activePayload[0].payload.y;
    setZoomArea({
      x1: chartX - offsetX,
      y1: chartY - offsetY,
      x2: chartX - offsetX,
      y2: chartY - offsetY,
    });
  }

  // Update zoom end coordinates
  function handleMouseMove(e, offset) {
    if (isZooming) {
      // console.log("zoom selecting");
      const { chartX, chartY, activePayload } = e || {};
      const { offsetX, offsetY } = offset || {};

      const xValue = activePayload[0] && activePayload[0].payload.x;
      const yValue = activePayload[0] && activePayload[0].payload.y;

      setZoomArea((prev) => ({
        ...prev,
        x2: chartX - offsetX,
        y2: chartY - offsetY,
      }));
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
  console.log(zoomArea);
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
        <Line dataKey="y" data={data} animationDuration={300} />
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

import Plot from "react-plotly.js";
import d3 from "d3";

const csvData = [
  [
    27.80985, 49.61936, 83.08067, 116.6632, 130.414, 150.7206, 220.1871,
    156.1536, 148.6416, 203.7845, 206.0386, 107.1618, 68.36975, 45.3359,
    49.96142, 21.89279, 17.02552, 11.74317, 14.75226, 13.6671, 5.677561,
    3.31234, 1.156517, -0.147662,
  ],
  [
    27.71966, 48.55022, 65.21374, 95.27666, 116.9964, 133.9056, 152.3412,
    151.934, 160.1139, 179.5327, 147.6184, 170.3943, 121.8194, 52.58537,
    33.08871, 38.40972, 44.24843, 69.5786, 4.019351, 3.050024, 3.039719,
    2.996142, 2.967954, 1.999594,
  ],
  [
    30.4267, 33.47752, 44.80953, 62.47495, 77.43523, 104.2153, 102.7393,
    137.0004, 186.0706, 219.3173, 181.7615, 120.9154, 143.1835, 82.40501,
    48.47132, 74.71461, 60.0909, 7.073525, 6.089851, 6.53745, 6.666096,
    7.306965, 5.73684, 3.625628,
  ],
  [
    16.66549, 30.1086, 39.96952, 44.12225, 59.57512, 77.56929, 106.8925,
    166.5539, 175.2381, 185.2815, 154.5056, 83.0433, 62.61732, 62.33167,
    60.55916, 55.92124, 15.17284, 8.248324, 36.68087, 61.93413, 20.26867,
    68.58819, 46.49812, 0.2360095,
  ],
  [
    8.815617, 18.3516, 8.658275, 27.5859, 48.62691, 60.18013, 91.3286, 145.7109,
    116.0653, 106.2662, 68.69447, 53.10596, 37.92797, 47.95942, 47.42691,
    69.20731, 44.95468, 29.17197, 17.91674, 16.25515, 14.65559, 17.26048,
    31.22245, 46.71704,
  ],
  [
    6.628881, 10.41339, 24.81939, 26.08952, 30.1605, 52.30802, 64.71007,
    76.30823, 84.63686, 99.4324, 62.52132, 46.81647, 55.76606, 82.4099,
    140.2647, 81.26501, 56.45756, 30.42164, 17.28782, 8.302431, 2.981626,
    2.698536, 5.886086, 5.268358,
  ],
  [
    21.83975, 6.63927, 18.97085, 32.89204, 43.15014, 62.86014, 104.6657,
    130.2294, 114.8494, 106.9873, 61.89647, 55.55682, 86.80986, 89.27802,
    122.4221, 123.9698, 109.0952, 98.41956, 77.61374, 32.49031, 14.67344,
    7.370775, 0.03711011, 0.6423392,
  ],
  [
    53.34303, 26.79797, 6.63927, 10.88787, 17.2044, 56.18116, 79.70141, 90.8453,
    98.27675, 80.87243, 74.7931, 75.54661, 73.4373, 74.11694, 68.1749, 46.24076,
    39.93857, 31.21653, 36.88335, 40.02525, 117.4297, 12.70328, 1.729771, 0.0,
  ],
  [
    25.66785, 63.05717, 22.1414, 17.074, 41.74483, 60.27227, 81.42432, 114.444,
    102.3234, 101.7878, 111.031, 119.2309, 114.0777, 110.5296, 59.19355,
    42.47175, 14.63598, 6.944074, 6.944075, 27.74936, 0.0, 0.0, 0.09449376,
    0.07732264,
  ],
  [
    12.827, 69.20554, 46.76293, 13.96517, 33.88744, 61.82613, 84.74799, 121.122,
    145.2741, 153.1797, 204.786, 227.9242, 236.3038, 228.3655, 79.34425,
    25.93483, 6.944074, 6.944074, 6.944075, 7.553681, 0.0, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 68.66396, 59.0435, 33.35762, 47.45282, 57.8355, 78.91689, 107.8275,
    168.0053, 130.9597, 212.5541, 165.8122, 210.2429, 181.1713, 189.7617,
    137.3378, 84.65395, 8.677168, 6.956576, 8.468093, 0.0, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 95.17499, 80.03818, 59.89862, 39.58476, 50.28058, 63.81641, 80.61302,
    66.37824, 198.7651, 244.3467, 294.2474, 264.3517, 176.4082, 60.21857,
    77.41475, 53.16981, 56.16393, 6.949235, 7.531059, 3.780177, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 134.9879, 130.3696, 96.86325, 75.70494, 58.86466, 57.20374, 55.18837,
    78.128, 108.5582, 154.3774, 319.1686, 372.8826, 275.4655, 130.2632,
    54.93822, 25.49719, 8.047439, 8.084393, 5.115252, 5.678269, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 48.08919, 142.5558, 140.3777, 154.7261, 87.9361, 58.11092, 52.83869,
    67.14822, 83.66798, 118.9242, 150.0681, 272.9709, 341.1366, 238.664, 190.2,
    116.8943, 91.48672, 14.0157, 42.29277, 5.115252, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 54.1941, 146.3839, 99.48143, 96.19411, 102.9473, 76.14089, 57.7844,
    47.0402, 64.36799, 84.23767, 162.7181, 121.3275, 213.1646, 328.482,
    285.4489, 283.8319, 212.815, 164.549, 92.29631, 7.244015, 1.167, 0.0, 0.0,
  ],
  [
    0.0, 6.919659, 195.1709, 132.5253, 135.2341, 89.85069, 89.45549, 60.29967,
    50.33806, 39.17583, 59.06854, 74.52159, 84.93402, 187.1219, 123.9673,
    103.7027, 128.986, 165.1283, 249.7054, 95.39966, 10.00284, 2.39255, 0.0,
    0.0,
  ],
  [
    0.0, 21.73871, 123.1339, 176.7414, 158.2698, 137.235, 105.3089, 86.63255,
    53.11591, 29.03865, 30.40539, 39.04902, 49.23405, 63.27853, 111.4215,
    101.1956, 40.00962, 59.84565, 74.51253, 17.06316, 2.435141, 2.287471,
    -0.0003636982, 0.0,
  ],
  [
    0.0, 0.0, 62.04672, 136.3122, 201.7952, 168.1343, 95.2046, 58.90624,
    46.94091, 49.27053, 37.10416, 17.97011, 30.93697, 33.39257, 44.03077,
    55.64542, 78.22423, 14.42782, 9.954997, 7.768213, 13.0254, 21.73166,
    2.156372, 0.5317867,
  ],
  [
    0.0, 0.0, 79.62993, 139.6978, 173.167, 192.8718, 196.3499, 144.6611,
    106.5424, 57.16653, 41.16107, 32.12764, 13.8566, 10.91772, 12.07177,
    22.38254, 24.72105, 6.803666, 4.200841, 16.46857, 15.70744, 33.96221,
    7.575688, -0.04880907,
  ],
  [
    0.0, 0.0, 33.2664, 57.53643, 167.2241, 196.4833, 194.7966, 182.1884,
    119.6961, 73.02113, 48.36549, 33.74652, 26.2379, 16.3578, 6.811293, 6.63927,
    6.639271, 8.468093, 6.194273, 3.591233, 3.81486, 8.600739, 5.21889, 0.0,
  ],
  [
    0.0, 0.0, 29.77937, 54.97282, 144.7995, 207.4904, 165.3432, 171.4047,
    174.9216, 100.2733, 61.46441, 50.19171, 26.08209, 17.18218, 8.468093,
    6.63927, 6.334467, 6.334467, 5.666687, 4.272203, 0.0, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 0.0, 31.409, 132.7418, 185.5796, 121.8299, 185.3841, 160.6566,
    116.1478, 118.1078, 141.7946, 65.56351, 48.84066, 23.13864, 18.12932,
    10.28531, 6.029663, 6.044627, 5.694764, 3.739085, 3.896037, 0.0, 0.0, 0.0,
  ],
  [
    0.0, 0.0, 19.58994, 42.30355, 96.26777, 187.1207, 179.6626, 221.3898,
    154.2617, 142.1604, 148.5737, 67.17937, 40.69044, 39.74512, 26.10166,
    14.48469, 8.65873, 3.896037, 3.571392, 3.896037, 3.896037, 3.896037,
    1.077756, 0.0,
  ],
  [
    0.001229679, 3.008948, 5.909858, 33.50574, 104.3341, 152.2165, 198.1988,
    191.841, 228.7349, 168.1041, 144.2759, 110.7436, 57.65214, 42.63504,
    27.91891, 15.41052, 8.056102, 3.90283, 3.879774, 3.936718, 3.968634,
    0.1236256, 3.985531, -0.1835741,
  ],
  [
    0.0, 5.626141, 7.676256, 63.16226, 45.99762, 79.56688, 227.311, 203.9287,
    172.5618, 177.1462, 140.4554, 123.9905, 110.346, 65.12319, 34.31887,
    24.5278, 9.561069, 3.334991, 5.590495, 5.487353, 5.909499, 5.868994,
    5.833817, 3.568177,
  ],
];

export function PlotlyDemo() {
  // Plotting the mesh
  var data: Plotly.Data[] = [
    {
      type: "surface",
      z: csvData,
      x: Array.from({ length: csvData[0].length }, (x, i) => i),
      y: Array.from({ length: csvData.length }, (x, i) => i),

      // contours: {
      //   z: {
      //     show: true,
      //     usecolormap: true,
      //     highlightcolor: "#42f462",
      //     project: { z: true },
      //   },
      // },
    },
  ];
  return (
    <div className="w-full h-[900px]">
      <Plot
        layout={{
          xaxis: {
            title: "x-axis",
            
          },
          yaxis: {
            title: "y-axis",
          },
          zaaxis: {
            title: "z-axis",
          }
        }}
        className="h-full"
        data={data}
      />
    </div>
  );
}

export default function Home() {
  // return <DataPlotUi/>
  // return <MapMessage latitude="53.80978957968428" longitude="-1.5547106082858528"/>
  // return <PlotZoom  />
  // return <PlotMessage {...PlotMessagesExample} />;

  // return <DeviceCarousel devices={DevicesExample}/>
  // return <FlowTest />;
  return <PlotlyDemo />;
  // return <PlotTest />
  // return <MenuTest />
  // return <PlotTest2 />;
  // return <DialogDemo />;
  // return <TipTap />
  // return <MentionExample />

  // return <TestNovel />
  // return <TextArea />
}

"use client";

import Image from "next/image";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsPanel } from "@/components/core/top-bar/tabs-panel";

import Visualizer from "next-route-visualizer";
import FlowChart, {
  GptResultExample,
} from "@/components/chat/flows/flow-chart";
import PlotMessage, {
  PlotMessagesExample,
} from "@/components/chat/plots/plot-message";
import { ConnectionSelector } from "@/components/core/connection/connection-selector";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ScatterCustomizedShape } from "recharts/types/cartesian/Scatter";

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
  const data: DataPlot = {
    title: "test",
    data: [
      {
        name: "Sensor 1",
        data: [
          { x: 2, y: 1 },
          { x: 3, y: 2 },
          { x: 4, y: 3 },
          { x: 5, y: 4 },
          { x: 6, y: 5 },
        ],
        fill: "#82ca9d",
      },
      {
        name: "Sensor 2",
        data: [
          { x: 10, y: 4 },
          { x: 2, y: 5 },
          { x: 3, y: 9 },
          { x: 4, y: 1 },
          { x: 5, y: 2 },

        ],
        fill: "#8884d8",
      },
    ],
    xLabel: "time",
    yLabel: "voltage",
  };

    // Sort each series data based on x values
    const sortedData = data.data.map((series) => ({
      ...series,
      data: series.data.slice().sort((a, b) => a.x - b.x),
    }));

  return (
    <ScatterChart
      width={600}
      height={320}
      title={data.title}
      className="mb-4"
      margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      }}
    >
      <CartesianGrid stroke="#4d4d4d" strokeDasharray="5 5" />
      <XAxis
        type="number"
        label={{ value: data.xLabel, position: "insideBottomMiddle", dy: 14 }}
        dataKey="x"
        name={data.xLabel}
        domain={["dataMin", "dataMax"]}
        tickCount={6} // Set the desired number of ticks
      />
      <ZAxis type="number" range={[100]} />
      <YAxis
        label={{
          value: data.yLabel,
          dx: 15,
          angle: -90,
          position: "insideLeft",
        }}
        type="number"
        dataKey="y"
        // domain={['dataMin', 'dataMax']}
        name={data.yLabel}
      />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Legend
        wrapperStyle={{ marginRight: "-10px" }}
        align="right"
        verticalAlign="top"
        layout="vertical"
      />
      {sortedData.map((series) => (
        <Scatter
          lineJointType="monotoneX"
          type="monotone"
          key={series.name}
          name={series.name}
          data={series.data}
          fill={series.fill}
          line
          shape={series.shape ?? "circle"}
        />
      ))}
    </ScatterChart>
  );
}

export default function Home() {
  // return <FlowTest/>
  // return <PlotTest />
  // return <MenuTest />
  return <PlotTest2 />;
}

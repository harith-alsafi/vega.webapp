"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretSortIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { ScatterCustomizedShape } from "recharts/types/cartesian/Scatter";
import CollapsableMessage from "@/components/chat/messages/collapsable-message";
import { useTheme } from "next-themes";

export interface DataPoint {
  name: string;
  x: number;
  y: number;
}

export interface DataSeries {
  name: string;
  data: DataPoint[];
  fill?: string;
  shape?: ScatterCustomizedShape;
}

export interface DataPlot {
  title: string;
  data: DataSeries[];
  xLabel: string;
  yLabel: string;
}

const colors = ["#82ca9d", "#8884d8", "#ffc658", "pink", "#ff7300"];

export const PlotMessagesExample: DataPlot = {
  title: "test",
  data: [
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
  ],
  xLabel: "time",
  yLabel: "voltage",
};

export function getRange(yValues: number[]): [number, number] {
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const range = yMax - yMin;
  return [yMin - range * 0.1, yMax + range * 0.1];
}

export default function PlotMessage({ data, title, xLabel, yLabel }: DataPlot) {
  const [refAreaLeft, setRefAreaLeft] = useState<string>("");
  const [refAreaRight, setRefAreaRight] = useState<string>("");

  const handleZoom = () => {
    // Handle zoom logic here
    console.log("Zooming...");
  };

  const handleZoomOut = () => {
    // Handle zoom out logic here
    console.log("Zooming out...");
  };


  // Sort each series data based on x values
  const sortedData = data.map((series) => ({
    ...series,
    data: series.data.slice().sort((a, b) => a.x - b.x),
  }));

  const maxTickCount = Math.max(...data.map((series) => series.data.length));
  const yValues = data.flatMap((series) => series.data.map((point) => point.y));
  const range = getRange(yValues);
  const isNegative = range[0] < 0;

  const { theme } = useTheme();

  return (
    <CollapsableMessage title={`Plot of ${title} (${xLabel} vs ${yLabel})`}>
      <LineChart
        className="mr-5"
        width={650}
        height={380}
        data={sortedData}
        margin={{ top: 10, right: 35, left: -5, bottom: 10 }}
        onMouseDown={(e) => setRefAreaLeft(String(e.activeLabel))}
        onMouseMove={(e) =>
          refAreaLeft &&
          setRefAreaRight(String(e.activeLabel))
        }
        onMouseUp={handleZoom}
      >
        <CartesianGrid stroke={theme === "light" ? "#d1d1d1": "#383838"} strokeDasharray="5 5" />
        <XAxis
          dataKey="x"
          domain={["dataMin", "dataMax"]}
          tickCount={maxTickCount}
          type="number"
          label={{ value: xLabel, position: "insideBottomMiddle", dy: 14 }}
          strokeWidth={isNegative ? 0 : 1}
        />
        <YAxis
          tickFormatter={(value) => value.toFixed(2)}
          allowDecimals={true}
          allowDataOverflow={true}
          domain={range}
          tickCount={maxTickCount}
          type="number"
          label={{
            value: yLabel,
            dx: 15,
            dy: -30,
            angle: 0,
            position: "insideTopLeft",
          }}
        />
        {isNegative && <ReferenceLine y={0} strokeWidth={1} stroke="#666666" />}
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
          align="center"
          verticalAlign="top"
          layout="horizontal"
        />
        {sortedData.map((sensor, index) => (
          <Line
            animationDuration={1200}
            strokeWidth={2}
            key={index}
            type="monotone"
            dataKey="y"
            data={sensor.data}
            name={sensor.name}
            stroke={colors[index % colors.length]}
            // dot={{ cursor: "pointer" }}
          />
        ))}
        {refAreaLeft && refAreaRight && (
          <ReferenceArea
            x1={refAreaLeft}
            x2={refAreaRight}
            strokeOpacity={0.3}
          />
        )}
      </LineChart>
    </CollapsableMessage>
  );
}

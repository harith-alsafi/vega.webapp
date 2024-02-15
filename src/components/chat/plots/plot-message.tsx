"use client";
import { Card } from "@/components/ui/card";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts";
import { ScatterCustomizedShape } from "recharts/types/cartesian/Scatter";

export interface DataPoint {
  name: string;
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

export default function PlotMessage({ data, title, xLabel, yLabel }: DataPlot) {
  // Sort each series data based on x values
  const sortedData = data.map((series) => ({
    ...series,
    data: series.data.slice().sort((a, b) => a.x - b.x),
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
        label={{ value: xLabel, position: "insideBottomMiddle", dy: 14 }}
      />
      <YAxis
        // dataKey="y"
        label={{
          value: yLabel,
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
          // dot={{ cursor: "pointer" }}
        />
      ))}
    </LineChart>
  );
}

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
import {
  ScatterCustomizedShape,
} from "recharts/types/cartesian/Scatter";

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

export const PlotMessagesExample: DataPlot = {
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
        { x: 2, y: 5 },
        { x: 3, y: 9 },
        { x: 4, y: 1 },
        { x: 5, y: 2 },
        { x: 10, y: 4 },
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
    <ScatterChart
      width={600}
      height={320}
      title={title}
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
        label={{ value: xLabel, position: "insideBottomMiddle", dy: 14 }}
        dataKey="x"
        name={xLabel}
        domain={["dataMin", "dataMax"]}
        tickCount={maxTickCount}
      />
      <YAxis
        label={{
          value: yLabel,
          dx: 15,
          angle: -90,
          position: "insideLeft",
        }}
        type="number"
        dataKey="y"
        // domain={['dataMin', 'dataMax']}
        name={yLabel}
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

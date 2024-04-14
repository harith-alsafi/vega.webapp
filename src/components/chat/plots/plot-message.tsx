"use client";
import { Card } from "@/components/ui/card";
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
  ResponsiveContainer,
  Brush,
} from "recharts";
import { ScatterCustomizedShape } from "recharts/types/cartesian/Scatter";
import CollapsableMessage from "@/components/chat/messages/collapsable-message";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataPoint, PiPlotResponse } from "@/services/rasberry-pi";
import "./style.css";
import { CategoricalChartState } from "recharts/types/chart/generateCategoricalChart";

const colors = ["#82ca9d", "#8884d8", "#ffc658", "pink", "#ff7300"];

export const PlotMessagesExample: PiPlotResponse = {
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

    },
  ],
  xLabel: "time",
  yLabel: "voltage",
};

function getRange(yValues: number[]): [number, number] {
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const range = yMax - yMin;
  return [yMin - range * 0.1, yMax + range * 0.1];
}

export interface AnalyticsInfo {
  header: string;
  minY: string;
  maxY: string;
  mean: string;
  median: string;
  std: string;
  mode: string;
  q1: string;
  q3: string;
  range: string;
}

function getAnalytics(
  header: string,
  yValues: number[]
): AnalyticsInfo | undefined {
  if (yValues.length === 0) return undefined;
  // convert yvalues from string to number
  yValues = yValues.map((value) => parseFloat(value.toString()));
  const sortedValues = [...yValues].sort((a, b) => a - b); // Create a copy of yValues to preserve the original order
  const yMin = sortedValues[0];
  const yMax = sortedValues[sortedValues.length - 1];
  const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;

  const middle = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
      : sortedValues[middle];

  const q1 = sortedValues[Math.floor(sortedValues.length / 4)];
  const q3 = sortedValues[Math.floor((sortedValues.length * 3) / 4)];

  const std = Math.sqrt(
    sortedValues.reduce((a, b) => a + (b - mean) ** 2, 0) / sortedValues.length
  );

  const mode = sortedValues.reduce(
    (a, b, i, arr) => {
      const count = arr.filter((v) => v === b).length;
      if (count > a[1]) {
        return [b, count];
      }
      return a;
    },
    [0, 0]
  )[0];

  const range = yMax - yMin;

  return {
    header: header,
    minY: yMin.toFixed(2),
    maxY: yMax.toFixed(2),
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    std: std.toFixed(2),
    mode: mode.toFixed(2),
    q1: q1.toFixed(2),
    q3: q3.toFixed(2),
    range: range.toFixed(2),
  };
}

export interface TableAnalyticsProps {
  analytics: AnalyticsInfo[];
}

export function TableAnalytics({ analytics }: TableAnalyticsProps) {
  const headers = analytics.map((info) => info.header);
  const keys = Object.keys(analytics[0]).filter((str) => str !== "header");
  return (
    <div className="max-w-full ml-1 mr-1 border rounded">
      <Table className="overflow-clip">
        <TableHeader className="text-center">
          <TableRow className="text-center">
            <TableHead className="text-center">Item</TableHead>
            {headers.map((header) => (
              <TableHead className="text-center" key={header}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key, index) => (
            <TableRow key={key} className="text-center">
              <TableCell className="text-center">
                {key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()}
              </TableCell>
              {analytics.map((info, index) => {
                let data = info[key as keyof AnalyticsInfo];

                return (
                  <TableCell className="text-center" key={index}>
                    {data}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter />
      </Table>
    </div>
  );
}

interface ZoomData {
  x1: number | null;
  x2: number | null;
}

export default function PlotMessage({ data, title, xLabel, yLabel }: PiPlotResponse) {
  // Sort each series data based on x values
  const sortedData = data.map((series) => ({
    ...series,
    data: series.data.slice().sort((a, b) => a.x - b.x),
  }));

  // data currently on the plot
  const [filteredData, setFilteredData] = useState(sortedData);
  const [zoomArea, setZoomArea] = useState<ZoomData>({ x1: null, x2: null });

  const mouseDown = (e: CategoricalChartState, offset: MouseEvent) => {
    if (offset.ctrlKey) {
      zoomOut();
      return;
    }
    const { activePayload } = e;
    if (activePayload && activePayload.length > 0) {
      const x = activePayload[0].payload.x;
      setZoomArea({ x1: x, x2: x });
    }
  };

  const mouseUp = () => {
    if (zoomArea.x1 !== null && zoomArea.x2 !== null) {
      // filter the data across the range of x1 and x2
      const newData = sortedData.map((series) => {
        const data = series.data.filter(
          (point) => point.x >= zoomArea.x1! && point.x <= zoomArea.x2!
        );
        return { ...series, data };
      });
      setFilteredData(newData);
      setZoomArea({ x1: null, x2: null });
    }
  };

  const mouseMove = (e: CategoricalChartState) => {
    const { activePayload } = e;
    if (activePayload && activePayload.length > 0) {
      const x = activePayload[0].payload.x;
      setZoomArea({ ...zoomArea, x2: x });
    }
  };

  const zoomOut = () => {
    setFilteredData(sortedData);
    setZoomArea({ x1: null, x2: null });
  };

  const maxTickCount = Math.max(
    ...filteredData.map((series) => series.data.length)
  );
  const yValues = filteredData.flatMap((series) =>
    series.data.map((point) => point.y)
  );
  const range = getRange(yValues);
  const isNegative = range[0] < 0;
  const { theme } = useTheme();

  const analyticsData = data
    .map((series) =>
      getAnalytics(
        series.name,
        series.data.map((point) => point.y)
      )
    )
    .filter((info) => info !== undefined) as AnalyticsInfo[];

  return (
    <CollapsableMessage title={`Plot of ${title} (${xLabel} vs ${yLabel})`}>
      <Tabs defaultValue="plot">
        <TabsList className="grid grid-cols-2 ml-1 mr-1">
          <TabsTrigger value="plot">Plot</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="plot" className="h-96">
          <ResponsiveContainer width={"100%"}>
            <LineChart
              data={sortedData}
              margin={{ top: 10, right: 35, left: -5, bottom: 10 }}
              onMouseDown={mouseDown}
              onMouseMove={mouseMove}
              onMouseUp={mouseUp}
            >
              <CartesianGrid
                style={{ userSelect: "none" }}
                stroke={theme === "light" ? "#d1d1d1" : "#383838"}
                strokeDasharray="5 5"
              />
              <XAxis
                style={{ userSelect: "none" }}
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                tickCount={maxTickCount}
                type="number"
                label={{
                  style: { userSelect: "none" },
                  value: xLabel,
                  position: "insideBottomMiddle",
                  dy: 14,
                }}
                strokeWidth={isNegative ? 0 : 1}
              />
              <YAxis
                style={{ userSelect: "none" }}
                tickFormatter={(value) => value.toFixed(2)}
                allowDecimals={true}
                allowDataOverflow={true}
                domain={range}
                tickCount={maxTickCount}
                type="number"
                label={{
                  style: { userSelect: "none" },
                  value: yLabel,
                  dx: 15,
                  dy: -30,
                  angle: 0,
                  position: "insideTopLeft",
                }}
              />

              {isNegative && (
                <ReferenceLine y={0} strokeWidth={1} stroke="#666666" />
              )}
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
              {filteredData.map((sensor, index) => (
                <Line
                  cursor={"pointer"}
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
              {zoomArea.x1 !== null && zoomArea.x2 !== null && (
                <ReferenceArea
                  x1={zoomArea.x1}
                  x2={zoomArea.x2}
                  strokeOpacity={0.3}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        <TabsContent value="summary">
          {analyticsData.length > 0 && (
            <TableAnalytics analytics={analyticsData} />
          )}
        </TabsContent>
      </Tabs>
    </CollapsableMessage>
  );
}

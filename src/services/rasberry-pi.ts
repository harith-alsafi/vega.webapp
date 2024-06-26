// "use server";
import { io } from "socket.io-client";
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  FunctionParameters,
} from "openai/resources";
import { MessageSystem, UiType } from "./chat-completion";
import { Socket } from "socket.io";
import { nanoid } from "@/lib/utils";
import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
import { PiFunction } from "react-icons/pi";
import { time } from "console";

export interface ParameterProperty {
  type: string;
  description: string;
}

export interface ParameterType extends FunctionParameters {
  type: "object";
  properties: Record<string, ParameterProperty>;
  required: string[];
  return: string;
}

export type PiBaseInfo = Omit<ChatCompletionTool["function"], "parameters">;

export interface PiToolInfo extends PiBaseInfo {
  parameters?: ParameterType;
}

export type ToolType = PiToolInfo | ChatCompletionTool["function"];

export type DeviceType = "pwm" | "digital" | "analog" | "i2c" | "serial";

export interface PiDeviceInfo extends PiBaseInfo {
  type: DeviceType;
  pins: string[];
  isInput: boolean;
  isConnected: boolean;
  value: string;
  hasRecordedData: boolean;
  frequency?: number;
}

export type PiInfo = PiDeviceInfo | ToolType;

export interface PiConnection {
  ip: string;
  port: number;
  url: string;
  id: string;
  status: boolean;
  devices: PiDeviceInfo[];
  tools: Array<ToolType>;
  socket?: Socket;
}

export interface DataPoint {
  name: string;
  x: number;
  y: number;
}

export interface DataSeries {
  name: string;
  data: DataPoint[];
}

export interface PiPlotResponse {
  title: string;
  data: DataSeries[];
  xLabel: string;
  yLabel: string;
}

export interface PiFunctionCallResponseBase {
  name: string;
  result: string;
  error?: string;
}

export interface PiMapResponse {
  longitude: string;
  latitude: string;
}

export interface PiFunctionCallResponseData extends PiFunctionCallResponseBase {
  ui?: Extract<UiType, "plot">;
  data?: PiPlotResponse;
}

export interface PiFunctionCallResponseString
  extends PiFunctionCallResponseBase {
  ui?: Extract<UiType, "image">;
  data?: string;
}

export interface PiFunctionCallResponseFlow extends PiFunctionCallResponseBase {
  ui?: Extract<UiType, "flow-chart">;
  data?: GptFlowChartResult;
}

export interface PiFunctionCallResponseCard extends PiFunctionCallResponseBase {
  ui?: Extract<UiType, "card">;
  data?: PiDeviceInfo;
}

export interface PiFunctionCallResponseMap extends PiFunctionCallResponseBase {
  ui?: Extract<UiType, "map">;
  data?: PiMapResponse;
}

export type PiFunctionCallResponse =
  | PiFunctionCallResponseData
  | PiFunctionCallResponseString
  | PiFunctionCallResponseFlow
  | PiFunctionCallResponseCard
  | PiFunctionCallResponseMap;

export const GetToolCalslUrl = "/get-tools";
export const RunToolCallUrl = "/run-tools";
export const GetDevicesUrl = "/get-devices";
export const ResetDevicesUrl = "/reset-devices";

export const ToolsExample: Array<ChatCompletionTool["function"]> = [
  {
    name: "plot-data",
    description:
      "Plots and shows a line chart when user asks you will not show the plot instead you will ONLY mention to the user that the plot has been shown above",
  },
  {
    name: "get_current_weather",
    description: "Gets the current weather",
  },
  {
    name: "get-time-city",
    description: "Gets the time for a specific city.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      return: "string",
      required: ["location"],
    },
  },
];

export const DevicesExample: PiDeviceInfo[] = [
  {
    type: "analog",
    name: "temperature",
    pins: ["0"],
    description: "Temperature sensor",
    isInput: false,
    isConnected: true,
    value: "30",
    hasRecordedData: true,
  },
  {
    type: "digital",
    name: "button",
    pins: ["D2"],
    description: "Button",
    isInput: true,
    isConnected: false,
    value: "0",
    hasRecordedData: false,
  },
  {
    type: "pwm",
    name: "led",
    pins: ["D3"],
    description: "LED",
    isInput: false,
    isConnected: true,
    value: "0",
    hasRecordedData: true,
    frequency: 100,
  },
  {
    type: "i2c",
    name: "oled",
    pins: ["SDA", "SCL"],
    description: "OLED Display",
    isInput: false,
    isConnected: true,
    value: "Hello World",
    hasRecordedData: true,
  },
];

export const DefaultPiConnection: PiConnection = {
  ip: "192.168.0.122",
  port: 5000,
  url: "https://192.168.0.122:5000",
  id: "",
  status: false,
  devices: DevicesExample,
  tools: ToolsExample,
};

export async function RunToolCalls(
  url: string,
  toolCall: ChatCompletionMessageToolCall[]
): Promise<PiFunctionCallResponse[] | null> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toolCall.map((call) => call.function)),
  });
  const json = await response.json();
  const data = json as PiFunctionCallResponse[];
  return data;
}

export async function ResetDevices(pi: PiConnection): Promise<void> {
  await fetch(pi.url + ResetDevicesUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GetDevices(
  url: string,
  names: string[] = []
): Promise<PiDeviceInfo[]> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(names),
  });
  const data = (await response.json()) as PiDeviceInfo[];
  return data;
}

export async function GetToolCalls(url: string): Promise<Array<ToolType>> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as ToolType[];
  return data;
}

async function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, milliseconds);
  });
}
// a polyfill for it would be:
AbortSignal.timeout ??= function timeout(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
};

export async function PingRaspberryPi(
  ip: string,
  port: number
): Promise<boolean> {
  try {
    const response = await fetch(`http://${ip}:${port}/`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function ConnectRaspberryPi(
  ip: string,
  port: number,
  url?: string
): Promise<PiConnection> {
  // await delay(2000);
  // return DefaultPiConnection;
  url = url || `http://${ip}:${port}`;
  const [devices, tools] = await Promise.all([
    GetDevices(url + GetDevicesUrl),
    GetToolCalls(url + GetToolCalslUrl),
  ]);
  if (!devices) {
    throw new Error("Failed to fetch devices");
  }
  if (!tools) {
    throw new Error("Failed to fetch tools");
  }
  return {
    ip,
    port,
    url,
    id: nanoid(),
    status: true,
    devices,
    tools,
  };
}

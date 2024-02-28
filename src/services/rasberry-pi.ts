// "use server";
import { io } from "socket.io-client";
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  FunctionParameters,
} from "openai/resources";
import { MessageSystem } from "./chat-completion";
import { Socket } from "socket.io";
import { DataPoint } from "@/components/chat/plots/plot-message";
import { nanoid } from "@/lib/utils";

export interface ParameterType extends FunctionParameters {
  type: "object";
  properties: Record<
    string,
    {
      type: string;
      description: string;
    }
  >;
  required: string[];
  return: string;
}

export type PiBaseInfo =  Omit<ChatCompletionTool["function"], "parameters">;

export interface PiToolInfo  extends PiBaseInfo{
  parameters?: ParameterType;
}

export type ToolType = PiToolInfo | ChatCompletionTool["function"];

export type DeviceType = "pwm" | "digital" | "analog" | "i2c";

export interface PiDeviceInfo extends PiBaseInfo{
  type: DeviceType;
  pins: string[];
  isInput: boolean;
  isConnected: boolean;
  value: string;
  hasData: boolean;
  frequency?: number;
}

export type PiInfo = PiDeviceInfo | ToolType;

export interface PiConnection {
  ip: string;
  port: number;
  url?: string;
  id: string;
  status: boolean;
  devices: PiDeviceInfo[];
  tools: Array<ToolType>;
  socket?: Socket;
}

export interface PiDataResponse {
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  title: string;
}

export interface PiFunctionCallResponse {
  name: string;
  result: string;
  status: boolean;
  data?: PiDataResponse;
}

export const GetToolCalslUrl = "/get-tools";
export const RunToolCallUrl = "/run-tools";
export const GetDevicesUrl = "/get-devices";

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
    hasData: true,
  },
  {
    type: "digital",
    name: "button",
    pins: ["D2"],
    description: "Button",
    isInput: true,
    isConnected: true,
    value: "0",
    hasData: true,
  },
  {
    type: "pwm",
    name: "led",
    pins: ["D3"],
    description: "LED",
    isInput: false,
    isConnected: true,
    value: "0",
    hasData: true,
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
    hasData: true,
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
): Promise<PiFunctionCallResponse | null> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toolCall),
  });
  return null;
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

export async function GetToolCalls(
  url: string,
): Promise<Array<ToolType>> {
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

export async function ConnectRaspberryPi(
  ip: string,
  port: number,
  url?: string
): Promise<PiConnection> {
  // await delay(2000);
  // return DefaultPiConnection;
  url = url || `http://${ip}:${port}`;
  const [devices, tools] = await Promise.all([
    GetDevices(url+GetDevicesUrl),
    GetToolCalls(url+GetToolCalslUrl),
  ]);
  if (!devices) {
    throw new Error("Failed to fetch devices");
  }
  if (!tools) {
    throw new Error("Failed to fetch tools");
  }
  return{
    ip,
    port,
    url,
    id: nanoid(),
    status: true,
    devices,
    tools,
  };
}

export function CreateSystemPrompt(piConnection: PiConnection): MessageSystem {
  return {
    role: "system",
    content: "",
  };
}

// "use server";
import { io } from "socket.io-client";

import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources";
import { MessageSystem } from "./chat-completion";
import { Socket } from "socket.io";

export interface PiComponentInfo
  extends Omit<ChatCompletionTool["function"], "parameters"> {
  type: string;
  pin: string;
}

export const FunctionCallUrl = "/get-function-calls";
export const RunFunctionCallUrl = "/run-function-call";
export const GetComponentsUrl = "/get-components";
export const GetComponentInfoUrl = "/get-component-info";

export interface ParameterType {

}

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

export const ComponentsExample: PiComponentInfo[] = [
  {
    type: "sensor",
    name: "temperature",
    pin: "A0",
    description: "Temperature sensor",
  },
  {
    type: "sensor",
    name: "humidity",
    pin: "A1",
    description: "Humidity sensor",
  },
  {
    type: "actuator",
    name: "led",
    pin: "D0",
    description: "LED",
  },
  {
    type: "actuator",
    name: "motor",
    pin: "D1",
    description: "Motor",
  },
];

export type PiInfo = PiComponentInfo | ChatCompletionTool["function"];

export interface PiConnection {
  ip: string;
  port: number;
  url?: string;
  id: string;
  status: boolean;
  components: PiComponentInfo[];
  tools: Array<ChatCompletionTool["function"]>;
  socket?: Socket;
}

export interface PiDataResponse {
  xValues: number[];
  yValues: number[];
  xLabel: string;
  yLabel: string;
  title: string;
  xInterval: number;
}

export interface PiFunctionCallResponse {
  status: boolean;
  error?: string;
  data?: any;
}

export const DefaultPiConnection: PiConnection = {
  ip: "192.168.0.122",
  port: 5000,
  url: "https://192.168.0.122:5000",
  id: "",
  status: false,
  components: ComponentsExample,
  tools: ToolsExample,
};

export async function GetComponentInfo(
  url: string,
  component: PiComponentInfo
): Promise<PiComponentInfo | null> {
  return null;
}

export async function RunFunctionCall(
  url: string,
  functionInfo: ChatCompletionTool["function"],
  functionCall: ChatCompletionMessageToolCall
): Promise<PiFunctionCallResponse | null> {
  return null;
}

export async function GetComponents(
  url: string
): Promise<PiComponentInfo[] | null> {
  return null;
}

export async function GetFunctionCalls(
  url: string
): Promise<Array<ChatCompletionTool["function"]> | null> {
  return null;
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
  url = url || `https://${ip}:${port}`;

  await delay(2000);
  return DefaultPiConnection;
}

export function CreateSystemPrompt(piConnection: PiConnection): MessageSystem {
  return {
    role: "system",
    content: "",
  };
}

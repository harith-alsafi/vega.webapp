import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources";

export interface PiComponentInfo {
  name: string;
  description: string;
  type: string;
  pin: string;
}

export const FunctionCallUrl = "/get-function-calls";
export const RunFunctionCallUrl = "/run-function-call";
export const GetComponentsUrl = "/get-components";
export const GetComponentInfoUrl = "/get-component-info";

export interface PiConnection {
  ip: string;
  port: number;
  url: string;
  id: string;
  status: boolean;
  components: PiComponentInfo[];
  functionCalls: Array<ChatCompletionTool["function"]>;
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

export async function ConnectRaspberryPi(
  port: number,
  ip: string
): Promise<PiConnection | null> {
  return null;
}

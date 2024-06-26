"use client";
import { nanoid } from "@/lib/utils";
import JSZip from "jszip";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";
import {
  ChatCompletionCreateParamsBase,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { useRef, useState } from "react";
import {
  GetEvaluation,
  UpdateChat,
  UpdateChatWithNameSpace,
  UpdateEvaluation,
} from "./database";
import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
import {
  PiConnection,
  PiPlotResponse,
  PiDeviceInfo,
  RunToolCallUrl,
  RunToolCalls,
  DataSeries,
  ResetDevices,
} from "./rasberry-pi";
import regression from "regression";
import { markdownTable } from "markdown-table";
import * as math from "mathjs";
import { saveAs } from "file-saver";
import { set } from "mongoose";

export const chatNameSpace = "chat:";
export const evalNameSpace = "eval:";
export const piNameSpace = "pi:1";

export interface InputRating {
  speed: number; // out of 100
  accuracy: number; // out of 100
  relevance: number; // out of 100
  efficiency: number; // out of 100
  completion: number; // out of 100
}

export interface RatingBase extends InputRating {
  finalRating: number; // out of 3 -> based on speed, accuracy, relevance, efficiency, completion

  successRate: number; // out of 100 -> based on completion, accuracy, relevance
}

export interface RatingResult extends RatingBase {
  taskComplexity: number;
}

export interface ChatBase {
  top_p: number;
  temperature: number;
  title: string;
}

export interface EvaluationResult extends ChatBase {
  results: RatingResult[];
  average: RatingResult;
}

export interface EvaluationInfo extends ChatBase {
  evaluationType: EvaluationType;
  content: EvaluationContent;
}

export interface MessageParameter {
  characterSize: number;
  generatedContext: number;
  calledTools: number;
  taskComplexity: number;
  totalTime: number;
}

export interface MessageRating extends RatingBase {
  timeTaken: number; // in seconds
  contextUsed: number; // in characters
  toolsCalled: number;
  comments?: string;
}

export interface EvaluationInput {
  content: string;
  taskComplexity: number;
  porbable_tools: string[];
}

export interface EvaluationOutput {
  messageParameter: MessageParameter;
  messageRating: MessageRating[];
}

export interface EvaluationContent {
  inputs: EvaluationInput[];
  outputs: EvaluationOutput[];
}

// System prompt
export interface MessageSystem extends ChatCompletionSystemMessageParam {
  isIgnored?: boolean;
}

// User message
export interface MessageUser extends ChatCompletionUserMessageParam {
  isIgnored?: boolean;
  messageParameter: MessageParameter;
}

export type UiType =
  | "flow-chart"
  | "plot"
  | "cards"
  | "image"
  | "table"
  | "map"
  | null;

// Response to a tool call
export interface MessageToolCallResponse
  extends ChatCompletionToolMessageParam {
  name?: string;
  ui?: UiType;
  data?: string | object | PiPlotResponse | GptFlowChartResult | PiDeviceInfo;
  status?: "loading" | "error" | "success";
  isIgnored?: boolean;
  error?: string;
  messageRating: MessageRating;
}

// Assistant message
export interface MessageAssistant
  extends Omit<ChatCompletionAssistantMessageParam, "function_call" | "name"> {
  ui?: UiType;
  data?: object;
  isIgnored?: boolean;
  messageRating: MessageRating;
}

export type Message =
  | MessageSystem
  | MessageUser
  | MessageToolCallResponse
  | MessageAssistant;

export type CompletionStatus =
  | "GptResponse"
  | "ToolCall"
  | "ToolCallResponse"
  | "Finish"
  | "None"
  | "FlowChart"
  | string;

export type EvaluationStatus = "GeneratingTest" | "None" | string;

export type EvaluationType =
  | "TopPvsTemperature"
  | "ComplexityOnly"
  | "ToolsOnly"
  | "TemperatureVsComplexity"
  | "TopPVsComplexity"
  | "all";

export interface MessageToolCall
  extends ChatCompletionMessageToolCall.Function {
  runCondition?: string;
}

export interface GptToolCallResponse {
  numberOfTools: number;
  tools: MessageToolCall[];
}

export interface Chat extends Omit<ChatCompletionCreateParamsBase, "messages"> {
  systemPrompt: MessageSystem;
  id: string;
  path: string;
  title: string;
  raspi_id?: string;
  messages: Message[];
  model: ChatCompletionCreateParamsNonStreaming["model"];
  temperature?: ChatCompletionCreateParamsNonStreaming["temperature"];
  tools?: ChatCompletionCreateParamsNonStreaming["tools"];
  sharePath?: string;
  evaluation?: EvaluationContent;
}

export interface ChatCompletion {
  evaluations: EvaluationInfo[];
  temperature: number;
  top_p: number;
  model: string;
  isLoading: boolean;
  messages: Message[];
  input: string;
  isMultipleToolCall: boolean;
  completionStatus: CompletionStatus;
  currentToolCall: string | null;
  append: (message: MessageUser) => Promise<Message[]>;
  reload: () => Promise<Message[]>;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  updateDataBase: (messages: Message[]) => Promise<void>;
  nextEvaluation: () => Promise<void>;
  runAllEvaluations: () => Promise<void>;
  generateTests: () => Promise<void>;
  saveChat: () => Promise<void>;
  saveEvaluation: () => Promise<void>;
  evaluationStatus: EvaluationStatus;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setCurrentToolCall: React.Dispatch<React.SetStateAction<string | null>>;
  isEvaluation: boolean;
  setIsEvaluation: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UseChatParams
  extends Omit<
    Chat,
    "messages" | "model" | "id" | "title" | "path" | "evaluation"
  > {
  connectionState: PiConnection;
  complexity?: number;
  initialEvaluations?: EvaluationInfo[];
  systemPrompt: MessageSystem;
  chatDbName?: string;
  id?: string;
  title?: string;
  path?: string;
  api?: string;
  model?: ChatCompletionCreateParamsNonStreaming["model"];
  devices: PiDeviceInfo[];
  initialMessages?: Message[];
  onResponse?: (response: Response, isAfterOnToolCall: boolean) => void;
  onFinish?: (message: Message, isAfterOnToolCall: boolean) => Promise<void>;
  onError?: (error: Error) => void;
  onToolCall?: (
    oldMessages: Message[],
    toolCalls: ChatCompletionMessageToolCall[]
  ) => Promise<Message[]>;
  onDbUpdate?: (chat: Chat) => void;
}

export function GetRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function GenerateMessageRating(): MessageRating {
  const speed = GetRndInteger(30, 90);
  const accuracy = GetRndInteger(30, 90);
  const relevance = GetRndInteger(30, 90);
  const efficiency = GetRndInteger(30, 90);
  const completion = GetRndInteger(30, 90);
  const toolsCalled = GetRndInteger(0, 5);
  const contextUsed = GetRndInteger(0, 1000);
  const finalRating =
    (speed + accuracy + relevance + efficiency + completion) / 5;
  const successRate = (speed + accuracy + relevance) / 3;
  return {
    successRate: successRate,
    toolsCalled: toolsCalled,
    contextUsed: contextUsed,
    timeTaken: GetRndInteger(10, 90),
    finalRating: finalRating,
    comments: "",
    speed: speed,
    accuracy: accuracy,
    relevance: relevance,
    efficiency: efficiency,
    completion: completion,
  };
}

export const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$

  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};

export async function RunCode(
  code: string,
  abortController?: () => AbortController | null
): Promise<MessageAssistant | null> {
  try {
    const response = await fetch("/api/code", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const message = (await response.json()) as MessageAssistant;
    if (message.content) {
      message.content = preprocessLaTeX(message.content as string);
    }
    return message;
  } catch (err) {
    console.log(err);
  }

  return null;
}

function calculateFourierCoefficients(
  xValues: number[],
  yValues: number[],
  N: number
): {
  a0: number;
  an: number[];
  bn: number[];
} {
  const n = xValues.length;
  const a0 = math.sum(yValues) / n;
  const an = Array(N).fill(0);
  const bn = Array(N).fill(0);

  for (let k = 1; k <= N; k++) {
    let sumCos = 0;
    let sumSin = 0;
    for (let i = 0; i < n; i++) {
      sumCos += yValues[i] * math.cos((2 * math.pi * k * xValues[i]) / n);
      sumSin += yValues[i] * math.sin((2 * math.pi * k * xValues[i]) / n);
    }
    an[k - 1] = (2 / n) * sumCos;
    bn[k - 1] = (2 / n) * sumSin;
  }

  return { a0, an, bn };
}

function generateLatexEquation(
  a0: number,
  an: number[],
  bn: number[],
  N: number,
  xValues: number[]
) {
  const L = xValues[xValues.length - 1] - xValues[0]; // Assuming xValues are sorted

  let equation = `f(x) = \\frac{${a0.toFixed(
    2
  )}}{2} + \\sum_{n=1}^{${N}} \\left[ ${an[0].toFixed(
    2
  )} \\cos\\left(\\frac{2\\pi nx}{${L}}\\right) + ${bn[0].toFixed(
    2
  )} \\sin\\left(\\frac{2\\pi nx}{${L}}\\right) \\right]`;

  for (let i = 1; i < N; i++) {
    equation += ` + \\left[ ${an[i].toFixed(2)} \\cos\\left(\\frac{2\\pi ${
      i + 1
    }x}{${L}}\\right) + ${bn[i].toFixed(2)} \\sin\\left(\\frac{2\\pi ${
      i + 1
    }x}{${L}}\\right) \\right]`;
  }

  return equation;
}

export function RegressionModel(
  data: DataSeries[],
  order?: number
): string | null {
  const actualOrder = order ?? 6;
  let resultData: Array<{
    name: string;
    result: regression.Result;
  }> = [];
  for (let i = 0; i < data.length; i++) {
    const dataSeries: regression.DataPoint[] = data[i].data.map((d) => [
      d.x,
      d.y,
    ]);
    const result = regression.polynomial(dataSeries, {
      precision: 2,
      order: actualOrder,
    });
    resultData.push({
      name: data[i].name,
      result: result,
    });
  }
  const markdown = markdownTable([
    ["Name", "Equation"],
    ...resultData.map((data) => {
      let expression = "";
      for (let i = 0; i < data.result.equation.length; i++) {
        const power = actualOrder - i;
        const coefficient = data.result.equation[i];
        if (coefficient !== 0 && coefficient !== -0) {
          const showPositiveSign = coefficient > 0 && expression.length > 0;
          if (power === 0) {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)}`;
          } else if (power === 1) {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)} \\cdot x`;
          } else {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)} \\cdot x^{${power}}`;
          }
        }
      }
      return [data.name, `$f(x) = ${expression}$`];
    }),
  ]);
  return markdown;
}

interface MessageReturn {
  newMessages: Message[];
  messageResponse: Message;
}

export interface ImageCaptionData {
  text: string;
  url: string;
}

export async function ImageCaptionAgent(
  text: string,
  imageUrl: string,
  abortController?: () => AbortController | null
): Promise<MessageAssistant | null> {
  try {
    const response = await fetch("/api/caption", {
      method: "POST",
      body: JSON.stringify({
        text: text,
        url: imageUrl,
      } as ImageCaptionData),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const message = (await response.json()) as MessageAssistant;
    if (message.content) {
      message.content = preprocessLaTeX(message.content as string);
    }
    return message;
  } catch (err) {
    console.log(err);
  }

  return null;
}

export async function ChatAgent(
  api: string,
  chat: Chat,
  abortController?: () => AbortController | null
): Promise<{ message: MessageAssistant; response: Response }> {
  const start = Date.now();
  const response = await fetch(api as string, {
    method: "POST",
    body: JSON.stringify(chat),
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController?.()?.signal,
  }).catch((err) => {
    throw err;
  });

  const message = (await response.json()) as MessageAssistant;
  if (message.content) {
    message.content = preprocessLaTeX(message.content as string);
  }
  if (message.messageRating === undefined) {
    message.messageRating = GenerateMessageRating();
  }
  const end = Date.now();
  message.messageRating.timeTaken = (end - start) / 1000;
  message.messageRating.contextUsed =
    message.content?.length ??
    message.tool_calls?.reduce((a, b) => a + b.function.name.length, 0) ??
    0;
  message.messageRating.toolsCalled = message.tool_calls?.length ?? 0;

  return { message, response };
}

export interface TestGeneratorAgentData {
  tools: ChatCompletionTool[];
  devices: PiDeviceInfo[];
  complexity: number;
  isSingleToolCall?: boolean;
}

export async function TestGeneratorAgent(
  data: TestGeneratorAgentData,
  abortController?: () => AbortController | null
): Promise<EvaluationInput | undefined> {
  let stringData = "";
  try {
    const response = await fetch("/api/tester", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const stringData = await response.json();
    if (stringData) {
      const inputs = stringData as EvaluationInput;
      if (inputs) {
        return inputs;
      }
    }
  } catch (err) {
    console.log(stringData);
    console.log(err);
  }

  return undefined;
}

export interface EvaluationAgentData {
  userMessage: MessageUser;
  generatedMessaages: (MessageAssistant | MessageToolCallResponse)[];
  tools: ChatCompletionTool[];
  devices: PiDeviceInfo[];
}

export async function EvaluationAgent(
  data: EvaluationAgentData,
  abortController?: () => AbortController | null
): Promise<EvaluationOutput | undefined> {
  try {
    const response = await fetch("/api/evaluator", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const json = await response.json();
    if (json) {
      const inputs = json as EvaluationOutput;
      return inputs;
    }
  } catch (err) {
    console.log(err);
  }

  return undefined;
}

export async function PlanningAgent(
  messages: Message[],
  tools: Array<ChatCompletionTool> | undefined,
  abortController?: () => AbortController | null
): Promise<Message | null> {
  try {
    const response = await fetch("/api/flowchart", {
      method: "POST",
      body: JSON.stringify({
        temperature: 0.5,
        messages,
        tools,
      } as Chat),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const json = await response.json();
    if (json) {
      const message = json as Message;
      if (message.role === "tool" && message.data) {
        const data = message.data as GptFlowChartResult;
        if (
          data.nodes &&
          data.nodes.length &&
          data.nodes.length > 1 &&
          data.edges
        ) {
          return message;
        }
      }
      return null;
    }
  } catch (err) {
    console.log(err);
  }

  return null;
}

export async function GetToolCallRaspi(
  pi: PiConnection,
  tools: Array<ChatCompletionTool>,
  toolCall: ChatCompletionMessageToolCall
): Promise<MessageToolCallResponse | undefined> {
  const data = await RunToolCalls(pi.url + RunToolCallUrl, [toolCall]);
  if (data && data.length > 0) {
    const firstData = data[0];

    const toolResponse: MessageToolCallResponse = {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      ui: firstData.ui,
      data: firstData.data,
      content: firstData.result,
      error: firstData.error,
      messageRating: GenerateMessageRating(),
    };
    if (firstData.ui === "image" && firstData.data) {
      const src = firstData.data as string;
      const message = await ImageCaptionAgent(
        "Get the description of the image",
        src
      );
      if (message?.content) {
        toolResponse.content = message?.content;
      }
    }
    return toolResponse;
  }

  return undefined;
}

export async function DefaultOnToolCall(
  connectionState: PiConnection,
  tools: Array<ChatCompletionTool>,
  oldMessages: Message[],
  toolCalls: ChatCompletionMessageToolCall[]
): Promise<Message[]> {
  let newMessages = oldMessages;
  for (const toolCall of toolCalls) {
    const start = Date.now();
    const toolResponse = await GetToolCallRaspi(
      connectionState,
      tools,
      toolCall
    );
    const end = Date.now();

    if (toolResponse) {
      toolResponse.messageRating.timeTaken = (end - start) / 1000;
      toolResponse.messageRating.contextUsed = toolResponse.content.length;
      toolResponse.messageRating.toolsCalled = 1;
      newMessages.push(toolResponse);
    }
  }
  return newMessages;
}

function generateArray(start: number, end: number, increment: number) {
  let array = [];
  for (let i = start; i <= end; i += increment) {
    array.push(i);
  }
  return array;
}

function generateCombinations(x: number[], y: number[]) {
  const xyCombinations: [number[]] = [[]];
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) {
      xyCombinations.push([x[i], y[j]]);
    }
  }
  return xyCombinations;
}

export interface EvaluationPlotData {
  evaluationType: EvaluationType;
  data: Array<{
    input: {
      top_p: number;
      temperature: number;
      complexity: number;
      title: string;
    };
    output: MessageRating;
  }>;
}

export function GetMessageRatingAverage(
  messageRatings: MessageRating[]
): MessageRating {
  if (messageRatings.length === 0) {
    return GenerateMessageRating();
  }

  if (messageRatings.length === 1) {
    return messageRatings[0];
  }

  const averageRating: MessageRating = messageRatings.reduce((a, b) => {
    return {
      speed: a.speed + b.speed,
      accuracy: a.accuracy + b.accuracy,
      relevance: a.relevance + b.relevance,
      efficiency: a.efficiency + b.efficiency,
      completion: a.completion + b.completion,
      finalRating: a.finalRating + b.finalRating,
      successRate: a.successRate + b.successRate,
      timeTaken: a.timeTaken + b.timeTaken,
      contextUsed: a.contextUsed + b.contextUsed,
      toolsCalled: a.toolsCalled + b.toolsCalled,
    };
  });

  return {
    speed: averageRating.speed / messageRatings.length,
    accuracy: averageRating.accuracy / messageRatings.length,
    relevance: averageRating.relevance / messageRatings.length,
    efficiency: averageRating.efficiency / messageRatings.length,
    completion: averageRating.completion / messageRatings.length,
    finalRating: averageRating.finalRating / messageRatings.length,
    successRate: averageRating.successRate / messageRatings.length,
    timeTaken: averageRating.timeTaken / messageRatings.length,
    contextUsed: averageRating.contextUsed / messageRatings.length,
    toolsCalled: averageRating.toolsCalled / messageRatings.length,
  } as MessageRating;
}

export function GetEvaluationPlotData(
  evaluations: EvaluationInfo[]
): EvaluationPlotData {
  const data: EvaluationPlotData["data"] = [];
  for (let i = 0; i < evaluations.length; i++) {
    const content = evaluations[i].content;
    const top_p = evaluations[i].top_p ?? defaultTopP;
    const temperature = evaluations[i].temperature ?? defaultTemp;
    for (let j = 0; j < content.outputs.length; j++) {
      const output = content.outputs[j];
      const msgRatingOutput = GetMessageRatingAverage(output.messageRating);
      const complexity =
        content.outputs[j].messageParameter.taskComplexity ?? 5;
      if (msgRatingOutput.speed === null) {
        msgRatingOutput.speed = GetRndInteger(30, 90);
      }
      if (msgRatingOutput.accuracy === null) {
        msgRatingOutput.accuracy = GetRndInteger(30, 90);
      }
      if (msgRatingOutput.relevance === null) {
        msgRatingOutput.relevance = GetRndInteger(30, 90);
      }
      if (msgRatingOutput.efficiency === null) {
        msgRatingOutput.efficiency = GetRndInteger(30, 90);
      }
      if (msgRatingOutput.completion === null) {
        msgRatingOutput.completion = GetRndInteger(30, 90);
      }
      if (msgRatingOutput.finalRating === null) {
        msgRatingOutput.finalRating =
          msgRatingOutput.speed +
          msgRatingOutput.accuracy +
          msgRatingOutput.relevance +
          msgRatingOutput.efficiency +
          msgRatingOutput.completion / 5;
      }
      if (msgRatingOutput.successRate === null) {
        msgRatingOutput.successRate =
          msgRatingOutput.completion +
          msgRatingOutput.accuracy +
          msgRatingOutput.relevance / 3;
      }
      if (msgRatingOutput.timeTaken === null) {
        msgRatingOutput.timeTaken = GetRndInteger(10, 90);
      }
      if (msgRatingOutput.contextUsed === null) {
        msgRatingOutput.contextUsed = GetRndInteger(0, 1000);
      }
      if (msgRatingOutput.toolsCalled === null) {
        msgRatingOutput.toolsCalled = GetRndInteger(0, 5);
      }
      if (msgRatingOutput.comments === null) {
        msgRatingOutput.comments = "none";
      }
      data.push({
        input: {
          top_p: top_p,
          temperature: temperature,
          complexity: complexity,
          title: evaluations[i].title ?? "none",
        },
        output: GetMessageRatingAverage(output.messageRating),
      });
    }
  }
  return {
    evaluationType: "all",
    data: data,
  };
}

export function ConvertToEvaluationPlotData(
  evaluationInfo: EvaluationInfo[],
  evaluationType: EvaluationType
): EvaluationPlotData {
  const evaluations = evaluationInfo.filter(
    (s) => s.evaluationType === evaluationType
  );
  const data: EvaluationPlotData["data"] = [];
  for (let i = 0; i < evaluations.length; i++) {
    for (let j = 0; j < evaluations[i].content.outputs.length; j++) {
      const output = evaluations[i].content.outputs[j];
      data.push({
        input: {
          top_p: evaluations[i].top_p,
          temperature: evaluations[i].temperature,
          complexity: evaluations[i].content.inputs[j].taskComplexity,
          title: evaluations[i].title,
        },
        output: GetMessageRatingAverage(output.messageRating),
      });
    }
  }
  return {
    evaluationType: evaluationType,
    data: data,
  };
}

const defaultTemp = 0.7;
const defaultTopP = 1.0;
const defaultComplexity = 5;
const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));
export function useChat(params: UseChatParams): ChatCompletion {
  let {
    api,
    connectionState,
    systemPrompt,
    id,
    path,
    raspi_id,
    title,
    model,
    top_p,
    temperature,
    tools,
    onResponse,
    onFinish,
    onError,
    onToolCall,
    initialMessages,
    onDbUpdate,
    chatDbName,
    devices,
    complexity,
    initialEvaluations,
  } = params;
  let actualComplexity = complexity ?? defaultComplexity;
  const ranged_values_tp = generateArray(0.0, 1, 0.05);
  const ranged_values_float = generateArray(0.1, 1, 0.1);
  const ranged_values_complexity = generateArray(1, 10, 1);

  const top_p_temp_map = generateCombinations(
    ranged_values_tp,
    ranged_values_tp
  );

  const float_vs_complexity_map = generateCombinations(
    ranged_values_float,
    ranged_values_complexity
  );

  const [isEvaluation, setIsEvaluation] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationInfo[]>(
    initialEvaluations ?? ([] as EvaluationInfo[])
  );
  const [evaluationStatus, setEvaluationStatus] =
    useState<EvaluationStatus>("None");
  let actualChatDbName =
    chatDbName ?? (isEvaluation ? evalNameSpace : chatNameSpace);
  let actualId = id ?? nanoid();
  let actualPath = path ?? `/chat/${id}`;
  api = api ?? "/api/chat";
  initialMessages = initialMessages ?? [];
  let actualTemperature = temperature ?? defaultTemp;
  let actualtTopP = top_p ?? defaultTopP;
  let finalModel = model ?? "gpt-3.5-turbo";
  let lastUserMessageIndex = 0;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isMultipleToolCall, setIsMultipleToolCall] = useState(false);
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>("None");
  let evaluationInputIndex = 0;
  let evaluationInfoIndex = 0;
  let currentEvaluation: EvaluationContent | undefined = undefined;
  let stopEval = false;

  const generateMessageParameter = (
    newMessages: Message[],
    message: MessageUser
  ) => {
    return {
      characterSize: message.content.length,
      generatedContext: 0,
      calledTools: 0,
      taskComplexity: 0,
      totalTime: 0,
    } as MessageParameter;
  };

  const getChat = (messages: Message[]): Chat => {
    if (messages.length > 0 && title === undefined) {
      const firstUserMessage = messages.find((s) => s.role === "user");
      if (firstUserMessage) {
        const content = firstUserMessage.content as string;
        title = content.substring(0, 50);
      }
    }

    return {
      top_p: actualtTopP,
      systemPrompt,
      title: title as string,
      id: actualId,
      path: actualPath,
      raspi_id,
      messages,
      model: finalModel,
      temperature: actualTemperature,
      tools,
      evaluation: currentEvaluation,
    };
  };

  const generateToolsOnly = async () => {
    const evaluationGen: EvaluationInfo[] = [];
    if (tools !== undefined && tools.length > 0) {
      const dataPromise = tools.map((d) => {
        return TestGeneratorAgent(
          {
            tools: [d],
            devices: devices,
            complexity: 1,
          } as TestGeneratorAgentData,
          () => abortControllerRef.current
        );
      });
      const generatedData = (await Promise.all(dataPromise)).filter(
        (s) => s !== undefined
      ) as EvaluationInput[];

      for (let i = 0; i < tools.length; i++) {
        if (i < generatedData.length) {
          const generated = generatedData[i];
          if (generated !== undefined) {
            const evaluationContent: EvaluationContent = {
              inputs: [generated],
              outputs: [],
            };
            const evaluationInfo: EvaluationInfo = {
              evaluationType: "ToolsOnly",
              content: evaluationContent,
              title: `${tools[i].function.name}`,
              temperature: defaultTemp,
              top_p: defaultTopP,
            };
            evaluationGen.push(evaluationInfo);
          }
        }
      }
    }

    return evaluationGen;
  };

  const generateTopPVsComplexityTests = async () => {
    const evaluationGen: EvaluationInfo[] = [];
    const dataPromise = float_vs_complexity_map.map((n) => {
      console.log(n);
      return TestGeneratorAgent(
        {
          tools: tools,
          devices: devices,
          complexity: n[1],
        } as TestGeneratorAgentData,
        () => abortControllerRef.current
      );
    });
    const generatedData = (await Promise.all(dataPromise)).filter(
      (s) => s !== undefined
    ) as EvaluationInput[];

    for (let i = 0; i < float_vs_complexity_map.length; i++) {
      if (i < generatedData.length) {
        const generated = generatedData[i];
        if (generated !== undefined) {
          const evaluationContent: EvaluationContent = {
            inputs: [generated],
            outputs: [],
          };
          const evaluationInfo: EvaluationInfo = {
            evaluationType: "TopPVsComplexity",
            content: evaluationContent,
            title: "TopPVsComplexity",
            temperature: defaultTemp,
            top_p: float_vs_complexity_map[i][0],
          };
          evaluationGen.push(evaluationInfo);
        }
      }
    }

    return evaluationGen;
  };

  const generateTemperatureVsComplexityTests = async () => {
    const evaluationGen: EvaluationInfo[] = [];
    const dataPromise = float_vs_complexity_map.map((n) => {
      return TestGeneratorAgent(
        {
          tools: tools,
          devices: devices,
          complexity: n[1],
        } as TestGeneratorAgentData,
        () => abortControllerRef.current
      );
    });
    const generatedData = (await Promise.all(dataPromise)).filter(
      (s) => s !== undefined
    ) as EvaluationInput[];

    for (let i = 0; i < float_vs_complexity_map.length; i++) {
      if (i < generatedData.length) {
        const generated = generatedData[i];
        if (generated !== undefined) {
          const evaluationContent: EvaluationContent = {
            inputs: [generated],
            outputs: [],
          };
          const evaluationInfo: EvaluationInfo = {
            evaluationType: "TemperatureVsComplexity",
            content: evaluationContent,
            title: "TemperatureVsComplexity",
            temperature: float_vs_complexity_map[i][0],
            top_p: defaultTopP,
          };
          evaluationGen.push(evaluationInfo);
        }
      }
    }

    return evaluationGen;
  };

  const generateComplexityOnlyTests = async () => {
    const evaluationGen: EvaluationInfo[] = [];
    const dataPromise = ranged_values_complexity.map((n) => {
      return TestGeneratorAgent(
        {
          tools: tools,
          devices: devices,
          complexity: n,
        } as TestGeneratorAgentData,
        () => abortControllerRef.current
      );
    });
    const generatedData = (await Promise.all(dataPromise)).filter(
      (s) => s !== undefined
    ) as EvaluationInput[];

    for (let i = 0; i < generatedData.length; i++) {
      if (i < generatedData.length) {
        const generated = generatedData[i];
        if (generated !== undefined) {
          const evaluationContent: EvaluationContent = {
            inputs: [generated],
            outputs: [],
          };
          const evaluationInfo: EvaluationInfo = {
            evaluationType: "ComplexityOnly",
            content: evaluationContent,
            title: "ComplexityOnly",
            temperature: defaultTemp,
            top_p: defaultTopP,
          };
          evaluationGen.push(evaluationInfo);
        }
      }
    }

    return evaluationGen;
  };

  const generateTopPvsTemperatureTests = async () => {
    const gen_evaluations: EvaluationInfo[] = [];
    const data = {
      tools: tools,
      devices: devices,
      complexity: defaultComplexity,
    } as TestGeneratorAgentData;
    const dataPromise = generateArray(0, top_p_temp_map.length, 1).map(() => {
      return TestGeneratorAgent(data, () => abortControllerRef.current);
    });

    const generatedData = (await Promise.all(dataPromise)).filter(
      (s) => s !== undefined
    ) as EvaluationInput[];

    if (generatedData.length >= top_p_temp_map.length) {
      for (let i = 0; i < top_p_temp_map.length; i++) {
        const generated = generatedData[i];
        if (generated !== undefined) {
          const evaluationContent: EvaluationContent = {
            inputs: [generated],
            outputs: [],
          };
          const evaluationInfo: EvaluationInfo = {
            evaluationType: "TopPvsTemperature",
            content: evaluationContent,
            title: "TopPvsTemperature",
            temperature: top_p_temp_map[i][1],
            top_p: top_p_temp_map[i][0],
          };
          gen_evaluations.push(evaluationInfo);
        }
      }
    }

    return gen_evaluations;
  };

  const generateAllTests = async () => {
    const data = await Promise.all([
      // generateComplexityOnlyTests(),
      // generateTopPvsTemperatureTests(),
      // generateToolsOnly(),
      // generateTemperatureVsComplexityTests(),
      generateTopPVsComplexityTests(),
    ]);
    const evaluationInfo = data.flat();
    if (evaluationInfo.length > 0) {
      setEvaluations(evaluationInfo);
      await UpdateEvaluation({
        evaluations: evaluationInfo,
        lastEvaluationContentIndex: 0,
        lastEvaluationIndex: 0,
      });
    }
  };

  const getDatabaseTests = async () => {
    const data = await GetEvaluation();
    if (data) {
      // // for(let i = 0; i < data.evaluations.length; i++){
      // //   data.evaluations[i].content.outputs = [];
      // // }
      // const evals = data.evaluations.filter(
      //   (s) => s.evaluationType === "TopPVsComplexity"
      // );
      setEvaluations(data.evaluations);
      evaluationInfoIndex = 0;
      evaluationInputIndex = 0;
    }
  };

  const generateTests = async () => {
    setEvaluationStatus("GeneratingTest");
    // await generateAllTests();
    await getDatabaseTests();
    setEvaluationStatus("None");
  };

  const getEvaluationOutput = async (
    evaluationInfo: EvaluationInfo
  ): Promise<EvaluationOutput> => {
    let currentMessages = messages;
    currentEvaluation = evaluationInfo.content;
    title = evaluationInfo.title;
    actualTemperature = evaluationInfo.temperature;
    actualtTopP = evaluationInfo.top_p;
    const input = currentEvaluation.inputs[evaluationInputIndex];
    const message = {
      content: input.content,
      role: "user",
    } as MessageUser;
    let messageParameter = generateMessageParameter(currentMessages, message);
    messageParameter.taskComplexity = input.taskComplexity;
    message.messageParameter = messageParameter;
    const newMessages = await append(message);
    currentMessages = newMessages;
    const lastUserMessage = currentMessages[lastUserMessageIndex];
    console.log(currentMessages);
    if (
      lastUserMessage.role === "user" &&
      lastUserMessage.messageParameter !== undefined
    ) {
      messageParameter = lastUserMessage.messageParameter;
    }

    const llmMessages = currentMessages
      .slice(lastUserMessageIndex + 1)
      .filter((m) => m.role === "system" || m.role === "tool");

    const llmResponseRating = llmMessages.map((m) => {
      const msg = m as MessageAssistant | MessageToolCallResponse;
      return msg.messageRating;
    });
    setEvaluationStatus("Generating evaluation feedback...");
    const evaluation = await EvaluationAgent(
      {
        userMessage: message,
        generatedMessaages: llmMessages as (
          | MessageAssistant
          | MessageToolCallResponse
        )[],
        tools: tools ?? [],
        devices: devices,
      },
      () => abortControllerRef.current
    );
    setEvaluationStatus("None");

    if (evaluation) {
      return evaluation;
    }

    const evaluationOutput: EvaluationOutput = {
      messageParameter,
      messageRating: llmResponseRating,
    };
    return evaluationOutput;
  };

  const nextEvaluation = async () => {
    let currentEvaluations = evaluations;
    if (
      !stopEval &&
      isEvaluation &&
      currentEvaluations.length > 0 &&
      evaluationInfoIndex < currentEvaluations.length
    ) {
      let evaluationInfo = currentEvaluations[evaluationInfoIndex];
      let evaluationContent = evaluationInfo.content;

      // next chat evaluation
      if (evaluationInputIndex >= evaluationContent.inputs.length) {
        evaluationInputIndex = 0;
        evaluationInfoIndex = evaluationInfoIndex + 1;
        id = nanoid();
        setMessages([]);

        evaluationInfo = currentEvaluations[evaluationInfoIndex];
        evaluationContent = evaluationInfo.content;
      }

      setEvaluationStatus(
        `Running ${evaluationInfo.title} infoIndex ${evaluationInfoIndex} inputIndex ${evaluationInputIndex}`
      );

      const output = await getEvaluationOutput(evaluationInfo);
      if (currentEvaluations[evaluationInfoIndex].content.inputs.length === 1) {
        currentEvaluations[evaluationInfoIndex].content.outputs = [output];
      } else {
        currentEvaluations[evaluationInfoIndex].content.outputs.push(output);
      }
      evaluationInputIndex = evaluationInputIndex + 1;
      setEvaluations(currentEvaluations);
      await ResetDevices(connectionState);
      // await UpdateEvaluation({
      //   evaluations: evaluations,
      //   lastEvaluationContentIndex: evaluationInfoIndex,
      //   lastEvaluationIndex: evaluationInputIndex,
      // });
      await sleep(1500);
    } else {
      setMessages([]);
    }
  };

  const runAllEvaluations = async () => {
    if (evaluations.length > 0) {
      evaluationInputIndex = 0;
      setMessages([]);
      while (
        evaluationInfoIndex < evaluations.length &&
        isEvaluation &&
        !stopEval
      ) {
        if (!isEvaluation || stopEval) {
          break; // Exit the loop if isEvaluation becomes false
        }
        await nextEvaluation();
      }
      stopEval = false;
      setEvaluationStatus("None");
    }
  };

  const saveEvaluation = async () => {
    if (evaluations.length > 0) {
      const zip = new JSZip();
      const finalData = JSON.stringify(
        GetEvaluationPlotData(
          evaluations.filter((s) => s.content.outputs.length > 0)
        )
      );
      // const all = JSON.stringify(evaluations);
      // const jsonComplexity = JSON.stringify(
      //   ConvertToEvaluationPlotData(evaluations, "ComplexityOnly")
      // );
      // const jsonTopPvsTemperature = JSON.stringify(
      //   ConvertToEvaluationPlotData(evaluations, "TopPvsTemperature")
      // );
      // const jsonToolsOnly = JSON.stringify(
      //   ConvertToEvaluationPlotData(evaluations, "ToolsOnly")
      // );
      // const jsonTemperatureVsComplexity = JSON.stringify(
      //   ConvertToEvaluationPlotData(evaluations, "TemperatureVsComplexity")
      // );
      // const jsonTopPVsComplexity = JSON.stringify(
      //   ConvertToEvaluationPlotData(evaluations, "TopPVsComplexity")
      // );
      // zip.file("complexity.json", jsonComplexity);
      // zip.file("topPvsTemperature.json", jsonTopPvsTemperature);
      // zip.file("toolsOnly.json", jsonToolsOnly);
      // zip.file("temperatureVsComplexity.json", jsonTemperatureVsComplexity);
      // zip.file("topPVsComplexity.json", jsonTopPVsComplexity);
      // zip.file("all.json", all);
      // zip.generateAsync({ type: "blob" }).then(function (content) {
      //   saveAs(content, "evaluation.zip");
      // });
      // const json = JSON.stringify(evaluations);
      const file = new Blob([finalData], { type: "application/json" });
      saveAs(file, "evaluation.json");
    }
  };

  const saveChat = async () => {
    const chat = getChat(messages);
    // save the chat to json file using file-saver
    const json = JSON.stringify(chat);
    const file = new Blob([json], { type: "application/json" });
    saveAs(file, "chat.json");
  };

  const updateDataBase = async (messages: Message[]): Promise<void> => {
    const chat = getChat(messages);
    // console.log("Updating database with chat", chat);
    await UpdateChatWithNameSpace(
      isEvaluation ? evalNameSpace : chatNameSpace,
      chat
    );
    if (onDbUpdate) {
      onDbUpdate(chat);
    }
  };

  const sendMessages = async (
    newMessages: Message[],
    isAfterOnToolCall: boolean
  ): Promise<MessageReturn> => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { message: messageResponse, response: response } = await ChatAgent(
      api as string,
      getChat(newMessages),
      () => abortControllerRef.current
    );

    // Check if the AbortController has been aborted
    if (abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = null;
      setIsLoading(false);
      throw new Error("Aborted");
    }

    newMessages = [...newMessages, messageResponse];

    await updateDataBase(newMessages);

    setMessages(newMessages);

    if (onResponse) {
      onResponse(response, isAfterOnToolCall);
    }
    if (onFinish) {
      await onFinish(messageResponse, isAfterOnToolCall);
    }

    return { newMessages, messageResponse };
  };

  const runToolCall = async (
    currentMessage: Message,
    messages: Message[]
  ): Promise<MessageReturn | null> => {
    let newMessages = messages;
    if (
      onToolCall &&
      currentMessage.role == "assistant" &&
      currentMessage.tool_calls &&
      currentMessage.tool_calls.length > 0
    ) {
      if (
        newMessages.length > 1 &&
        lastUserMessageIndex === newMessages.length - 2
      ) {
        const start = Date.now();

        setCompletionStatus("Generating Execution Plan ...");
        const flowToolCall = await PlanningAgent(
          newMessages,
          tools,
          () => abortControllerRef.current
        );
        const end = Date.now();

        if (flowToolCall) {
          if (flowToolCall.role === "tool") {
            flowToolCall.messageRating.timeTaken = (end - start) / 1000;
            flowToolCall.messageRating.contextUsed =
              flowToolCall.content.length;
            flowToolCall.messageRating.toolsCalled = 1;
          }
          newMessages = [...newMessages, flowToolCall];
          setMessages(newMessages);
        }
      }

      setCompletionStatus(
        "Calling " + currentMessage.tool_calls[0].function.name + " ..."
      );

      const toolMessages = await onToolCall(
        newMessages,
        currentMessage.tool_calls
      );

      newMessages = toolMessages;
      setMessages(newMessages);

      setCompletionStatus("Waiting for the LLM feedback ...");
      let response = await sendMessages(newMessages, true);

      newMessages = response.newMessages;
      setMessages(newMessages);
      setCompletionStatus("Finished");

      return response;
    }
    return null;
  };

  const sendMessage = async (message?: Message) => {
    setIsLoading(true);
    let newMessages = messages;
    if (message != undefined) {
      newMessages = [...messages, message];
      setMessages(newMessages);
    } else if (messages.length > 0) {
      if (lastUserMessageIndex > 0) {
        newMessages = messages.slice(0, lastUserMessageIndex + 1);
        setMessages(newMessages);
      } else if (lastUserMessageIndex === 0 && newMessages.length > 0) {
        newMessages = [messages[0]];
        setMessages(newMessages);
      }
    }
    try {
      const start = Date.now();
      setCompletionStatus("Getting LLM response ...");
      let response: MessageReturn | null = await sendMessages(
        newMessages,
        true
      );

      newMessages = response.newMessages;
      let lastUserMessage = newMessages[lastUserMessageIndex];
      if (
        lastUserMessage.role === "user" &&
        lastUserMessage.messageParameter !== undefined
      ) {
        lastUserMessage.messageParameter.generatedContext +=
          response.messageResponse.content?.length ?? 0;
        newMessages[lastUserMessageIndex] = lastUserMessage;
      }
      response = await runToolCall(response.messageResponse, newMessages);
      while (response != null) {
        newMessages = response.newMessages;
        if (
          lastUserMessage.role === "user" &&
          lastUserMessage.messageParameter !== undefined
        ) {
          lastUserMessage.messageParameter.generatedContext +=
            response.messageResponse.content?.length ?? 0;
          lastUserMessage.messageParameter.calledTools += 1;
          newMessages[lastUserMessageIndex] = lastUserMessage;
        }

        response = await runToolCall(response.messageResponse, newMessages);
      }
      const end = Date.now();
      if (
        lastUserMessage.role === "user" &&
        lastUserMessage.messageParameter !== undefined
      ) {
        lastUserMessage.messageParameter.totalTime = (end - start) / 1000;
        newMessages[lastUserMessageIndex] = lastUserMessage;
      }
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
      setCurrentToolCall(null);
      setCompletionStatus("None");
      abortControllerRef.current = null;
    }
    return newMessages;
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopEval = true;
    setIsEvaluation(false);
  };

  const append = async (message: MessageUser) => {
    lastUserMessageIndex = messages.length;
    if (message.messageParameter === undefined) {
      message.messageParameter = generateMessageParameter(messages, message);
    }
    return await sendMessage(message);
  };

  const reload = async () => {
    lastUserMessageIndex = messages.findLastIndex(
      (message) => message.role === "user"
    );
    return await sendMessage();
  };

  return {
    isLoading,
    append,
    reload,
    stop,
    messages,
    setMessages,
    completionStatus,
    input,
    setInput,
    updateDataBase,
    isMultipleToolCall,
    currentToolCall,
    setCurrentToolCall,
    nextEvaluation,
    saveChat,
    temperature: actualTemperature,
    top_p: actualtTopP,
    model: finalModel,
    saveEvaluation,
    isEvaluation,
    generateTests,
    runAllEvaluations,
    setIsEvaluation,
    evaluations,
    evaluationStatus,
  } as ChatCompletion;
}

export function CreateSystemPrompt(piConnection: PiConnection): MessageSystem {
  const devices = piConnection.devices.map((device) => {
    return JSON.stringify({
      name: device.name,
      description: device.description,
      isInput: device.isInput,
      hasRecordedData: device.hasRecordedData,
    });
  });
  const devicesString = devices.join(", ");
  return {
    role: "system",
    content:
      "You are connected to a raspberry pi which has the following connected circuit components as a JSON object in which isInput field indicates if its an input or output device and hasRecordedData field indicates if the device has recorded data which can be extracted: " +
      devicesString +
      " \n When you are tasked with any tool call make sure you ONLY reply with the given information and don't add anything else unless instructed to",
  };
}

import { nanoid } from "@/lib/utils";
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
import { UpdateChat, UpdateChatWithNameSpace } from "./database";
import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
import {
  PiConnection,
  PiPlotResponse,
  PiDeviceInfo,
  RunToolCallUrl,
  RunToolCalls,
  DataSeries,
} from "./rasberry-pi";
import regression from "regression";
import { markdownTable } from "markdown-table";
import * as math from "mathjs";
import { saveAs } from "file-saver";

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

export type EvaluationStatus =
  | "GeneratingTest"
  | "None"
  | "RunningTests"
  | string;

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
  temperature: number;
  top_p: number;
  model: string;
  isLoading: boolean;
  messages: Message[];
  input: string;
  isMultipleToolCall: boolean;
  completionStatus: CompletionStatus;
  currentToolCall: string | null;
  append: (message: MessageUser) => Promise<void>;
  reload: () => void;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  updateDataBase: (messages: Message[]) => Promise<void>;
  nextEvaluation: () => Promise<void>;
  saveChat: () => Promise<void>;
  saveEvaluation: () => Promise<void>;
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
  initialEvaluation?: EvaluationContent;
  initialEvaluations?: EvaluationInfo[];
  systemPrompt: MessageSystem;
  chatDbName?: string;
  id?: string;
  title?: string;
  path?: string;
  api?: string;
  model?: ChatCompletionCreateParamsNonStreaming["model"];
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
  const speed = GetRndInteger(10, 90);
  const accuracy = GetRndInteger(10, 90);
  const relevance = GetRndInteger(10, 90);
  const efficiency = GetRndInteger(10, 90);
  const completion = GetRndInteger(10, 90);
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
  complexity?: number;
  dataSize: number;
  isSingleToolCall?: boolean;
}

export async function TestGeneratorAgent(
  data: TestGeneratorAgentData,
  abortController?: () => AbortController | null
): Promise<EvaluationInput[] | undefined> {
  try {
    const response = await fetch("/api/tester", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.()?.signal,
    });
    const json = await response.json();
    if (json) {
      const inputs = json as EvaluationInput[];
      if (inputs.length > 0) {
        return inputs;
      }
    }
  } catch (err) {
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

export async function FlowChartAgent(
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
  console.log(data);
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
    console.log("Tool Response: ", toolResponse);
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

export function useChat(params: UseChatParams): ChatCompletion {
  let {
    api,
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
    initialEvaluations,
  } = params;
  const [isEvaluation, setIsEvaluation] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationInfo[] | undefined>(
    initialEvaluations
  );
  let actualChatDbName =
    chatDbName ?? (isEvaluation ? evalNameSpace : chatNameSpace);
  let actualId = id ?? nanoid();
  let actualPath = path ?? `/chat/${id}`;
  api = api ?? "/api/chat";
  initialMessages = initialMessages ?? [];
  let actualTemperature = temperature ?? 0.7;
  let actualtTopP = top_p ?? 0.7;
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
  let evaluationIndex = 0;
  let evaluationInfoIndex = 0;
  let currentEvaluation: EvaluationContent | undefined = undefined;

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

  const generateTests = async () => {};

  const getEvaluationOutput = async (
    evaluationInfo: EvaluationInfo
  ): Promise<EvaluationOutput> => {
    currentEvaluation = evaluationInfo.content;
    title = evaluationInfo.title;
    actualTemperature = evaluationInfo.temperature;
    actualtTopP = evaluationInfo.top_p;
    const input = currentEvaluation.inputs[evaluationIndex];
    const message = {
      content: input.content,
      role: "user",
    } as MessageUser;
    let messageParameter = generateMessageParameter(messages, message);
    messageParameter.taskComplexity = input.taskComplexity;
    message.messageParameter = messageParameter;
    await append(message);
    const lastUserMessage = messages[lastUserMessageIndex];
    if (
      lastUserMessage.role === "user" &&
      lastUserMessage.messageParameter !== undefined
    ) {
      messageParameter = lastUserMessage.messageParameter;
    }
    const llmResponseRating = messages
      .slice(lastUserMessageIndex + 1)
      .filter((m) => m.role === "system" || m.role === "tool")
      .map((m) => {
        const msg = m as MessageAssistant | MessageToolCallResponse;
        return msg.messageRating;
      });
    const evaluationOutput: EvaluationOutput = {
      messageParameter,
      messageRating: llmResponseRating,
    };
    return evaluationOutput;
  };

  const nextEvaluation = async () => {
    if (
      initialEvaluations &&
      initialEvaluations.length > 0 &&
      evaluationInfoIndex < initialEvaluations.length
    ) {
      let evaluationInfo = initialEvaluations[evaluationIndex];
      let evaluationContent = evaluationInfo.content;

      if (evaluationIndex < evaluationContent.inputs.length - 1) {
        // still on current evaluation
        const output = await getEvaluationOutput(evaluationInfo);
        initialEvaluations[evaluationInfoIndex].content.outputs.push(output);
        evaluationIndex = evaluationIndex + 1;
      } else {
        // next chat evaluation
        evaluationIndex = 0;
        evaluationInfoIndex = evaluationInfoIndex + 1;
        id = nanoid();
        setMessages([]);

        evaluationInfo = initialEvaluations[evaluationInfoIndex];
        evaluationContent = evaluationInfo.content;
        const output = await getEvaluationOutput(evaluationInfo);
        initialEvaluations[evaluationInfoIndex].content.outputs.push(output);
        evaluationIndex = evaluationIndex + 1;
      }
    }
  };

  const saveEvaluation = async () => {
    if (initialEvaluations !== undefined) {
      const json = JSON.stringify(initialEvaluations);
      const file = new Blob([json], { type: "application/json" });
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
    await UpdateChatWithNameSpace(actualChatDbName, chat);
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

        setCompletionStatus("Generating Flow Chart ...");
        const flowToolCall = await FlowChartAgent(
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
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const append = async (message: MessageUser) => {
    lastUserMessageIndex = messages.length;
    if (message.messageParameter === undefined) {
      message.messageParameter = generateMessageParameter(messages, message);
    }
    sendMessage(message);
  };

  const reload = () => {
    lastUserMessageIndex = messages.findLastIndex(
      (message) => message.role === "user"
    );
    sendMessage();
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
    setIsEvaluation,
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

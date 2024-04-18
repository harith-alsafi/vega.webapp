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
import regression, { power } from "regression";
import { markdownTable } from "markdown-table";
import * as math from "mathjs";
import nerdamer from "nerdamer";

export const chatNameSpace = "chat:";
export const piNameSpace = "pi:1";

// System prompt
export interface MessageSystem extends ChatCompletionSystemMessageParam {
  isIgnored?: boolean;
}

export interface MessageParameter {
  characterSize: number;
  totalContext: number;
  calledTools: number;
  taskComplexity: number;
  temperature: number;
  totalTools: number;
}

// User message
export interface MessageUser extends ChatCompletionUserMessageParam {
  isIgnored?: boolean;
  messageParameter?: MessageParameter;
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
  comments?: string;
  messageRating: MessageRating;
}

export function GetRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export interface MessageRating {
  finalRating: number; // out of 3
  comments: string;
  timeTaken: number; // in seconds
  speed: number; // out of 3
  accuracy: number; // out of 3
  relevance: number; // out of 3
  clarity: number; // out of 3
  completion: number; // out of 3
}

export function GenerateMessageRating(): MessageRating {
  const speed = GetRndInteger(10, 90);
  const accuracy = GetRndInteger(10, 90);
  const relevance = GetRndInteger(10, 90);
  const clarity = GetRndInteger(10, 90);
  const completion = GetRndInteger(10, 90);
  const finalRating = (speed + accuracy + relevance + clarity + completion) / 5;

  return {
    timeTaken: GetRndInteger(10, 90),
    finalRating: finalRating,
    comments: "",
    speed: speed,
    accuracy: accuracy,
    relevance: relevance,
    clarity: clarity,
    completion: completion,
  };
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
}

export interface ChatCompletion {
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
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setCurrentToolCall: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface UseChatParams
  extends Omit<Chat, "messages" | "model" | "id" | "title" | "path"> {
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

export interface ChatImageCapttion {
  text: string;
  url: string;
}

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

export async function ImageDescriptionAgent(
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
      } as ChatImageCapttion),
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

export async function SendGpt(
  api: string,
  chat: Chat,
  abortController?: () => AbortController | null
): Promise<{ message: MessageAssistant; response: Response }> {
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

  return { message, response };
}

interface MessageReturn {
  newMessages: Message[];
  messageResponse: Message;
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
      messageRating: GenerateMessageRating(),
    };
    if (firstData.ui === "image" && firstData.data) {
      const src = firstData.data as string;
      const message = await ImageDescriptionAgent(
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
    temperature,
    tools,
    onResponse,
    onFinish,
    onError,
    onToolCall,
    initialMessages,
    onDbUpdate,
    chatDbName,
  } = params;

  let actualChatDbName = chatDbName ?? chatNameSpace;
  let actualId = id ?? nanoid();
  let actualPath = path ?? `/chat/${id}`;
  api = api ?? "/api/chat";
  initialMessages = initialMessages ?? [];
  temperature = temperature ?? 0.7;
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

  const generateMessageParameter = (
    newMessages: Message[],
    message: MessageUser
  ) => {
    const contextSum =
      newMessages
        .map((m) => m.content?.length ?? 0)
        .reduce((a, b) => a + b, 0) +
      systemPrompt.content.length +
      message.content.length;

    return {
      temperature: temperature ?? 0.7,
      totalTools: tools?.length ?? 0,
      characterSize: message.content.length,
      totalContext: contextSum,
      calledTools: 0,
      taskComplexity: 0,
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
      systemPrompt,
      title: title as string,
      id: actualId,
      path: actualPath,
      raspi_id,
      messages,
      model: finalModel,
      temperature,
      tools,
    };
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

    const start = Date.now();
    const { message: messageResponse, response: response } = await SendGpt(
      api as string,
      getChat(newMessages),
      () => abortControllerRef.current
    );
    const end = Date.now();
    messageResponse.messageRating.timeTaken = (end - start) / 1000;

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
      setCompletionStatus("Getting LLM response ...");
      let response: MessageReturn | null = await sendMessages(
        newMessages,
        true
      );

      newMessages = response.newMessages;

      response = await runToolCall(response.messageResponse, newMessages);
      while (response != null) {
        newMessages = response.newMessages;
        const lastUserMessage = newMessages[lastUserMessageIndex];
        if (lastUserMessage.role === "user") {
          if (lastUserMessage.messageParameter === undefined) {
            lastUserMessage.messageParameter = generateMessageParameter(
              newMessages,
              lastUserMessage
            );
          }
          lastUserMessage.messageParameter.calledTools += 1;
          newMessages[lastUserMessageIndex] = lastUserMessage;
        }

        response = await runToolCall(response.messageResponse, newMessages);
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

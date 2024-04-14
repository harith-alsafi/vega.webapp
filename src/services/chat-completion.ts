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
import {
  GptFlowChartResult,
} from "@/components/chat/flows/flow-chart";
import { PiConnection, PiPlotResponse, PiDeviceInfo, RunToolCallUrl, RunToolCalls, DataSeries } from "./rasberry-pi";
import regression from 'regression';
import {markdownTable} from 'markdown-table'

export const chatNameSpace = "chat:";
export const piNameSpace = "pi:1";

// System prompt
export interface MessageSystem extends ChatCompletionSystemMessageParam {
  isIgnored?: boolean;
}

// User message
export interface MessageUser extends ChatCompletionUserMessageParam {
  isIgnored?: boolean;
}

export type UiType = "flow-chart" | "plot" | "cards" | "image"  | "table" | "map" | null;

// Response to a tool call
export interface MessageToolCallResponse
  extends ChatCompletionToolMessageParam {
  name?: string;
  ui?: UiType;
  data?: string | object | PiPlotResponse | GptFlowChartResult | PiDeviceInfo;
  status?: "loading" | "error" | "success";
  isIgnored?: boolean;
  comments?: string;
}

// Assistant message
export interface MessageAssistant
  extends Omit<ChatCompletionAssistantMessageParam, "function_call" | "name"> {
  ui?: UiType;
  data?: object;
  isIgnored?: boolean;
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
  | "FlowChart";

export interface MessageToolCall
  extends ChatCompletionMessageToolCall.Function {
  runCondition?: string;
}

export interface GptToolCallResponse {
  numberOfTools: number;
  tools: MessageToolCall[];
}

export interface Chat extends Omit<ChatCompletionCreateParamsBase, "messages"> {
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
  append: (message: Message) => Promise<void>;
  reload: () => void;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  updateDataBase: (messages: Message[]) => Promise<void>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setCurrentToolCall: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface UseChatParams
  extends Omit<Chat, "messages" | "model" | "id" | "title" | "path"> {
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

export function RegressionModel(data: DataSeries[]): string | null {
  let resultData: Array<{
    name: string;
    result: regression.Result
  }> = [];
  for (let i = 0; i < data.length; i++) {
    const dataSeries: regression.DataPoint[] = data[i].data.map(d => [d.x, d.y]);
    const result = regression.polynomial(dataSeries, { precision: 2 });
    resultData.push({
      name: data[i].name,
      result: result
    });
  }
  // convert into markdown table with following collums 
  // colum 1: name of the data series, colum 2: equation of polynomial regression in latex such that equation: [ai, .... , a0] in the form aixj ... + a0x0

  const markdown = markdownTable([
    ['Name', 'Equation'],
    ...resultData.map((data) => [data.name, `$${data.result.string}$`])
  ])
  return markdown;
}

export async function ImageDescriptionAgent(text: string, imageUrl: string,  abortController?: () => AbortController | null): Promise<MessageAssistant | null>{
  try{
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
    if(message.content){
      message.content = preprocessLaTeX(message.content as string);
    }
    return message;
  }
  catch(err){
    console.log(err);
  }

  return null;
}

export async function SendGpt(
  api: string,
  chat: Chat,
  abortController?: () => AbortController | null
): Promise<{ message: Message; response: Response }> {
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

  const message = (await response.json()) as Message;
  if(message.content){
    message.content = preprocessLaTeX(message.content as string);
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
        if (data.nodes && data.nodes.length && data.nodes.length > 1 && data.edges) {
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

export async function DefaultOnToolCall(connectionState: PiConnection, 
  tools: Array<ChatCompletionTool>,
  oldMessages: Message[],
  toolCalls: ChatCompletionMessageToolCall[]): Promise<Message[]> {
    for (const toolCall of toolCalls) {
      const toolResponse = await GetToolCallRaspi(
        connectionState,
        tools,
        toolCall
      );
      if (toolResponse) {
        oldMessages.push(toolResponse);
      }
    }
    return oldMessages;
}

export function useChat(params: UseChatParams): ChatCompletion {
  let {
    api,
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
    chatDbName
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

  const getChat = (messages: Message[]): Chat => {
    return {
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

    if (
      newMessages.length > 0 &&
      newMessages[0].role === "user" &&
      title === undefined
    ) {
      const content = newMessages[0].content as string;
      title = content.substring(0, 50);
    }

    const { message: messageResponse, response: response } = await SendGpt(
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
        setCompletionStatus("FlowChart");
        const flowToolCall = await FlowChartAgent(
          newMessages,
          tools,
          () => abortControllerRef.current
        );
        if (flowToolCall) {
          newMessages = [...newMessages, flowToolCall];
          setMessages(newMessages);
        }
      }

      setCompletionStatus("ToolCall");

      const toolMessages = await onToolCall(
        newMessages,
        currentMessage.tool_calls
      );

      newMessages = toolMessages;
      setMessages(newMessages);

      setCompletionStatus("ToolCallResponse");
      let response = await sendMessages(newMessages, true);

      newMessages = response.newMessages;
      setMessages(newMessages);
      setCompletionStatus("Finish");

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
      setCompletionStatus("GptResponse");
      let response: MessageReturn | null = await sendMessages(
        newMessages,
        true
      );

      newMessages = response.newMessages;

      response = await runToolCall(response.messageResponse, newMessages);
      while (response != null) {
        newMessages = response.newMessages;
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

  const append = async (message: Message) => {
    lastUserMessageIndex = messages.length;
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
      hasData: device.hasData,
    });
  });
  const devicesString = devices.join(", ");
  return {
    role: "system",
    content: "You are connected to a raspberry pi which has the following connected circuit components as a JSON object in which isInput field indicates if its an input or output device and hasData field indicates if the device has stored data which can be fetched: " + devicesString + " \n When you are tasked with any tool call make sure you ONLY reply with the given information and don't add anything else unless instructed to",
  };
}

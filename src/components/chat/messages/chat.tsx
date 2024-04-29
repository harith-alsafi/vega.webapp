"use client";

import {
  useChat,
  Message,
  MessageToolCallResponse,
  DefaultOnToolCall,
  CreateSystemPrompt,
  GenerateMessageRating,
  EvaluationInfo,
} from "@/services/chat-completion";
import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/messages/chat-list";
import { ChatPanel } from "@/components/chat/messages/chat-panel";
import {
  EmptyScreen,
} from "@/components/chat/messages/empty-screen";
import { ChatScrollAnchor } from "@/components/chat/messages/chat-scroll-anchor";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources";
import { emitUpdateSidebarEvent } from "@/lib/event-emmiter";
import { useConnectionContext } from "@/lib/context/connection-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChatCompletionProvider } from "@/lib/context/chat-completion-context";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageParamLabel } from "@/components/chat/messages/message-container";
import { MdFunctions } from "react-icons/md";
import { PiCircuitry } from "react-icons/pi";
import { CiTempHigh } from "react-icons/ci";
import { GiCardRandom } from "react-icons/gi";
import { TiMessages } from "react-icons/ti";
import { BsRobot } from "react-icons/bs";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

const tools: Array<ChatCompletionTool> = [
  {
    type: "function",
    function: {
      name: "plot-data",
      description:
        "Plots and shows a line chart when user asks you will not show the plot instead you will ONLY mention to the user that the plot has been shown above",
    },
  },
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Gets the current weather",
    },
  },
  {
    type: "function",
    function: {
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
  },
];

async function getToolCall(
  tools: Array<ChatCompletionTool>,
  toolCall: ChatCompletionMessageToolCall
): Promise<MessageToolCallResponse | undefined> {
  if (toolCall.function.name === "plot-data") {
    const toolResponse: MessageToolCallResponse = {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      ui: "plot",
      content:
        "The plot has been ALREADY shown the user, just inform the user it is shown above",
      messageRating: GenerateMessageRating(),
    };

    return toolResponse;
  } else if (toolCall.function.name === "get_current_weather") {
    const temperature = Math.floor(Math.random() * (100 - 30 + 1) + 30);
    const weather = ["sunny", "cloudy", "rainy", "snowy"][
      Math.floor(Math.random() * 4)
    ];
    const toolResponse: MessageToolCallResponse = {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      content: JSON.stringify({
        temperature,
        weather,
        info: "This data is randomly generated and came from a fake weather API!",
      }),
      messageRating: GenerateMessageRating(),
    };

    return toolResponse;
  } else if (toolCall.function.name === "get-time-city") {
    const data = toolCall.function.arguments;
    if (data) {
      // const location = JSON.parse(data).location;
      // const time = new Date().toLocaleTimeString("en-US", { timeZone: location });
      const toolResponse: MessageToolCallResponse = {
        tool_call_id: toolCall.id,
        role: "tool",
        name: toolCall.function.name,
        content: `The current time in John is 2pm`,
        messageRating: GenerateMessageRating(),
      };
      return toolResponse;
    }
  }
  return undefined;
}

const EvaluationArray: Array<EvaluationInfo> = [
  {
    top_p: 0.9,
    temperature: 0.7,
    title: "Single component test",
    content: {
      inputs: [
        {
          content: "",
          taskComplexity: 8,
          porbable_tools: [],
        },
      ],
      outputs: [],
    },
  },
];

export function Chat({ id, initialMessages, className, title }: ChatProps) {
  const [statsIsOpen, setStatsIsOpen] = useState(false);
  const [evaluationResultIsOpen, setEvaluationResultIsOpen] = useState(false);
  const { connectionState } = useConnectionContext();
  const systemPrompt = CreateSystemPrompt(connectionState);
  const tools = connectionState.tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  })) as Array<ChatCompletionTool>;
  const path = usePathname();
  const [updatedSideBar, setUpdatedSideBar] = useState(false);

  const chatCompletion = useChat({
    initialEvaluations: EvaluationArray,
    title: title,
    systemPrompt: systemPrompt,
    api: "/api/chat/openai",
    initialMessages,
    id: id,
    tools: tools,
    onResponse(response, isAfterOnToolCall) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    async onFinish(message, isAfterOnToolCall) {
      if (!path.includes("chat")) {
        window.history.pushState({}, "", `/chat/${id}`);
      }
    },
    onError(error) {
      console.log("messages error", messages);
      toast.error(error.message);
    },
    onDbUpdate(chat) {
      if (!updatedSideBar && !path.includes("chat")) {
        emitUpdateSidebarEvent();
        setUpdatedSideBar(true);
      }
    },
    async onToolCall(oldMessages, toolCalls) {
      return await DefaultOnToolCall(
        connectionState,
        tools,
        oldMessages,
        toolCalls
      );
    },
  });

  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
    completionStatus,
    saveChat,
    nextEvaluation,
    temperature,
    top_p,
    model,
    saveEvaluation,
    isEvaluation,
    setIsEvaluation,
  } = chatCompletion;

  useHotkeys(
    // next evaluation
    "ctrl+n",
    async () => {
      if (isEvaluation) {
        await nextEvaluation();
      }
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    "ctrl+q", // regenate
    async () => {
      await reload();
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    "ctrl+u", // stop
    async () => {
      await stop();
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    // show chat stats
    "ctrl+i",
    async () => {
      setStatsIsOpen(true);
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    // show evaluation result
    "ctrl+k",
    async () => {
      setEvaluationResultIsOpen(true);
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    // save chat
    "ctrl+shift+s",
    async () => {
      await saveChat();
    },
    { scopes: ["chat"] }
  );

  useHotkeys(
    // save evaluation
    "ctrl+alt+s",
    async () => {
      await saveEvaluation();
    },
    { scopes: ["chat"] }
  );

  return (
    <HotkeysProvider initiallyActiveScopes={["chat"]}>
      <ChatCompletionProvider chatCompletion={chatCompletion}>
        <div className={cn("mb-8 pb-[200px] pt-4 md:pt-10", className)}>
          {messages.length > 0 ? (
            <>
              <ChatList
                completionStatus={completionStatus}
                isLoading={isLoading}
                messages={messages}
              />
              <ChatScrollAnchor trackVisibility={isLoading} />
            </>
          ) : (
            <EmptyScreen
              isEvaluation={isEvaluation}
              setIsEvaluation={setIsEvaluation}
              setInput={setInput}
            />
          )}
        </div>
        <ContextMenu>
          <ContextMenuTrigger>
            <ChatPanel
              setMessages={setMessages}
              id={id}
              isLoading={isLoading}
              stop={stop}
              append={append}
              reload={reload}
              messages={messages}
              input={input}
              setInput={setInput}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Expand All</ContextMenuItem>
            <ContextMenuItem>Collapse All</ContextMenuItem>
            <ContextMenuItem>Rerun All</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Dialog
          open={statsIsOpen}
          onOpenChange={(val) => {
            setStatsIsOpen(val);
          }}
        >
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>Chat Stats</DialogTitle>
            </DialogHeader>
            <div className="flex-col flex">
              <MessageParamLabel
                label="LLM Model"
                icon={<BsRobot className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={model}
              />
              <MessageParamLabel
                label="Total Messages"
                icon={<TiMessages className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={messages.length}
              />
              <MessageParamLabel
                label="Total Tools"
                icon={<MdFunctions className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={connectionState.tools.length}
              />
              <MessageParamLabel
                label="Total Devices"
                icon={<PiCircuitry className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={connectionState.devices.length}
              />
              <MessageParamLabel
                label="Temperature"
                icon={<CiTempHigh className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={temperature}
              />
              <MessageParamLabel
                label="Top P"
                icon={<GiCardRandom className="w-6 h-6" />}
                valueClassName="w-[100px]"
                value={top_p}
              />
            </div>
          </DialogContent>
        </Dialog>
        {isEvaluation ? (
          <Dialog
            open={evaluationResultIsOpen}
            onOpenChange={(val) => {
              setEvaluationResultIsOpen(val);
            }}
          >
            <DialogContent className="">
              <DialogHeader>
                <DialogTitle>Evluation Result</DialogTitle>
              </DialogHeader>

              <div className="flex-col flex"></div>
            </DialogContent>
          </Dialog>
        ) : null}
      </ChatCompletionProvider>
    </HotkeysProvider>
  );
}

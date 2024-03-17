"use client";

import {
  useChat,
  Message,
  MessageToolCallResponse,
} from "@/services/chat-completion";
import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/messages/chat-list";
import { ChatPanel } from "@/components/chat/messages/chat-panel";
import { EmptyScreen } from "@/components/chat/messages/empty-screen";
import { ChatScrollAnchor } from "@/components/chat/messages/chat-scroll-anchor";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import {
  GetDevices,
  GetDevicesUrl,
  PiConnection,
  RunToolCallUrl,
  RunToolCalls,
} from "@/services/rasberry-pi";

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
      };
      return toolResponse;
    }
  }
  return undefined;
}

async function getToolCallRaspi(
  pi: PiConnection,
  tools: Array<ChatCompletionTool>,
  toolCall: ChatCompletionMessageToolCall
): Promise<MessageToolCallResponse | undefined> {
  const data = await RunToolCalls(pi.url + RunToolCallUrl, [toolCall]);
  console.log(data)
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
    console.log("Tool Response: ", toolResponse);
    return toolResponse;
  }

  return undefined;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const { connectionState } = useConnectionContext();
  const tools = 
    connectionState.tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })) as Array<ChatCompletionTool>
  ;
  const path = usePathname();
  const [updatedSideBar, setUpdatedSideBar] = useState(false);
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
  } = useChat({
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
      // console.log("OnFinish: ", message);
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
      for (const toolCall of toolCalls) {
        const toolResponse = await getToolCallRaspi(
          connectionState,
          tools,
          toolCall
        );
        if (toolResponse) {
          oldMessages.push(toolResponse);
        }
      }
      return oldMessages;
    },
  });

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className={cn("mb-8 pb-[200px] pt-4 md:pt-10", className)}>
            {messages.length ? (
              <>
                <ChatList
                  completionStatus={completionStatus}
                  isLoading={isLoading}
                  messages={messages}
                />
                <ChatScrollAnchor trackVisibility={isLoading} />
              </>
            ) : (
              <EmptyScreen setInput={setInput} />
            )}
          </div>
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
    </>
  );
}

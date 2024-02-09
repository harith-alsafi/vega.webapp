"use client";

// import { useChat, type Message } from "ai/react";

import {
  useChat,
  Message,
  MessageToolCallResponse,
} from "@/services/chat-completion";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname, useRouter } from "next/navigation";
import { ChatRequest, nanoid } from "ai";
import { toast } from "sonner";
import {
  ChatCompletionCreateParams,
  ChatCompletionFunctionCallOption,
  ChatCompletionTool,
} from "openai/resources";
import ChartMessage from "./chat/message/chart-message";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
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
];

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    "ai-token",
    null
  );
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
  const [previewTokenInput, setPreviewTokenInput] = useState(
    previewToken ?? ""
  );

  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
    completionStatus
  } = useChat({
    api: "/api/chat/internal",
    initialMessages,
    id: id,
    tools,
    onResponse(response, isAfterOnToolCall) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    async onFinish(message, isAfterOnToolCall) {
      if (!path.includes('chat')) {
        window.history.pushState({}, '', `/chat/${id}`)
      }
      console.log("OnFinish: ", message);
    },
    onError(error) {
      toast.error(error.name);
    },
    async onToolCall(oldMessages, toolCalls) {
      const toolCall = toolCalls[0];
      if (toolCall.function.name === "plot-data") {
        const toolResponse: MessageToolCallResponse = {
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          ui: <div> <ChartMessage/> </div>,
          content:
            "The plot has been ALREADY shown the user, just inform the user it is shown above",
        };

        return [...oldMessages, toolResponse] as Message[];
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
        return [...oldMessages, toolResponse] as Message[];
      }
      return oldMessages;
    },
  });

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {messages.length ? (
          <>
            <ChatList completionStatus={completionStatus} isLoading={isLoading}  messages={messages} />
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

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{" "}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{" "}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={(e) => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput);
                setPreviewTokenDialog(false);
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { CompletionStatus, Message } from "@/services/chat-completion";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";
import { cn } from "@/lib/utils";
import { IconOpenAI } from "./ui/icons";
import { ring } from "ldrs";

ring.register();


export interface ChatList {
  messages: Message[];
  isLoading: boolean;
  completionStatus: CompletionStatus;
}

export function LoadingMessage({completionStatus}: {completionStatus: CompletionStatus}) {
  return (
    <div>
      {completionStatus === "GptResponse" ? <Separator className="my-4 md:my-8" /> : null} 
      <div className="relative mx-auto max-w-2xl px-4">
        <div className={cn("group relative mb-4 flex items-start md:-ml-12")}>
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
              "bg-primary text-primary-foreground"
            )}
          >
            <IconOpenAI />
          </div>
          <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
            <l-ring
              size="30"
              stroke="5"
              bg-opacity="0.12"
              speed="2"
              color="white"
            ></l-ring>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SingleChat({
  message,
  index,
  maxLength,
}: {
  message: Message;
  index: number;
  maxLength: number;
}) {
  if (message.role === "tool" && message.name == "plot-data" && message.ui) {
    console.log("message", message);
    return message.ui;
  }
  if (message.role === "tool" && message.name == "get_current_weather") {
    return null;
  }
  if (
    (message.role === "assistant" && message.tool_calls == null) ||
    message.role === "user"
  ) {
    return (
      <div key={index}>
        <ChatMessage message={message} />
        {index < maxLength - 1 && <Separator className="my-4 md:my-8" />}
      </div>
    );
  }
}

export function ChatList({ messages, isLoading, completionStatus }: ChatList) {
  if (!messages.length) {
    return null;
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        return (
          <SingleChat
            key={index}
            message={message}
            index={index}
            maxLength={messages.length}
          />
        );
      })}
      {isLoading ? <LoadingMessage completionStatus={completionStatus}  /> : null}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { CompletionStatus, Message } from "@/services/chat-completion";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/messages/chat-message";
import { IconOpenAI } from "@/components/ui/icons";
import { ring } from "ldrs";
import PlotMessage, { PlotMessagesExample } from "../plots/plot-message";
import FlowChart, { GptFlowChartResult } from "../flows/flow-chart";
import { DevicesExample } from "@/services/rasberry-pi";
import DeviceCarousel from "@/components/chat/device-carousel/device-carousel";
import { useTheme } from "next-themes";
import CollapsableMessage from "./collapsable-message";

ring.register();

export interface ChatList {
  messages: Message[];
  isLoading: boolean;
  completionStatus: CompletionStatus;
}

export function LoadingMessage({
  completionStatus,
}: {
  completionStatus: CompletionStatus;
}) {
  const { theme } = useTheme();
  return (
    <>
      {completionStatus === "GptResponse" ? (
        <Separator className="my-4 md:my-8" />
      ) : null}
      <div className="group relative mb-4 flex items-start md:-ml-12">
        <div className="flex mt-[0.23rem] size-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground">
          <IconOpenAI />
        </div>
        <div className="flex px-1 ml-4 mb-10">
          <div className="mb-5 pb-6 ">
            <l-ring
              size="30"
              stroke="5"
              bg-opacity="0.12"
              speed="2"
              color={theme === "dark" ? "white" : ""}
            ></l-ring>
          </div>
          <p className="mb-2 ml-2 last:mb-0">{completionStatus}</p>
        </div>
      </div>
    </>
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
  if (message.role === "tool" && message.ui === "image") {
    const src = message.data as string;
    return (
      <CollapsableMessage title="Raspberry Pi Image">
        <img
          src={src}
          alt="Image raspberry pi"
          className="object-cover object-center h-full w-full"
        />
      </CollapsableMessage>
    );
  }
  if (message.role === "tool" && message.name === "get-time-city") {
    return (
      <div>
        <DeviceCarousel devices={DevicesExample} />
      </div>
    );
  }

  if (message.role === "tool" && message.name == "plot-data" && message.ui) {
    return (
      <div>
        <PlotMessage {...PlotMessagesExample} />
      </div>
    );
  }
  if (message.role === "tool" && message.data && message.ui === "flow-chart") {
    const result = message.data as GptFlowChartResult;
    return <FlowChart nodes={result.nodes} edges={result.edges} />;
  }
  if (
    (message.role === "assistant" && message.content !== null) ||
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
  // const combinedMessages: Message[] = [];
  // let currentMessage: Message | null = null;
  // for (const message of messages) {
  //   if (message.role === "user" || message.role === "assistant") {
  //     if (!currentMessage || message.role !== currentMessage.role) {
  //       // If the current message is null or has a different role, push the message as is
  //       combinedMessages.push({ ...message });
  //       currentMessage = { ...message };
  //     } else {
  //       // If the current message has the same role, combine the content with a newline
  //       currentMessage.content += `\n${message.content}`;
  //     }
  //   } else {
  //     // If the role is "tool", push it directly without combining
  //     combinedMessages.push({ ...message });
  //     currentMessage = null;
  //   }
  // }
  // console.log("messages", messages);
  // console.log("combinedMessages", combinedMessages);

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
      {isLoading ? (
        <LoadingMessage completionStatus={completionStatus} />
      ) : null}
    </div>
  );
}

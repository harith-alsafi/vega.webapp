/* eslint-disable @next/next/no-img-element */
import { CompletionStatus, Message } from "@/services/chat-completion";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/messages/chat-message";
import { IconOpenAI } from "@/components/ui/icons";
import { ring } from "ldrs";
import PlotMessage, {
  DataPlot,
  PlotMessagesExample,
} from "../plots/plot-message";
import FlowChart, { GptFlowChartResult } from "../flows/flow-chart";
import { DevicesExample, PiDeviceInfo } from "@/services/rasberry-pi";
import DeviceCarousel from "@/components/chat/device-carousel/device-carousel";
import { useTheme } from "next-themes";
import CollapsableMessage from "./collapsable-message";
import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  if (message.role === "tool" && message.ui === "image" && message.data) {
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
  if (message.role === "tool" && message.ui === "cards" && message.data) {
    const data = message.data as PiDeviceInfo[];
    return (
      <div>
        <DeviceCarousel devices={data} />
      </div>
    );
  }
  if (message.role === "tool" && message.ui == "plot" && message.data) {
    const data = message.data as DataPlot;
    return (
      <div>
        <PlotMessage {...data} />
      </div>
    );
  }
  if (message.role === "tool" && message.data && message.ui === "flow-chart") {
    const result = message.data as GptFlowChartResult;
    return <FlowChart nodes={result.nodes} edges={result.edges} />;
  }
  if (message.role === "tool" && message.data && message.ui === "table") {
    const data = message.data as string;
    <CollapsableMessage title="Table">
      <MemoizedReactMarkdown
        className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          thead: ({ children }) => (
            <TableHeader className="divide-y text-center">
              {children}
            </TableHeader>
          ),
          th: ({ children }) => (
            <TableHead className="divide-y text-center">{children}</TableHead>
          ),
          tfoot: ({ children }) => (
            <TableFooter className="divide-y">{children}</TableFooter>
          ),
          td: ({ children }) => (
            <TableCell className="divide-y">{children}</TableCell>
          ),
          tbody: ({ children }) => (
            <TableBody className="divide-y">{children}</TableBody>
          ),
          tr: ({ children }) => (
            <TableRow className="border-t text-center">{children}</TableRow>
          ),
          table: ({ children }) => (
            <div className="rounded-md border mb-2 mt-2">
              <Table className="">{children}</Table>
            </div>
          ),
        }}
      >
        {data}
      </MemoizedReactMarkdown>
    </CollapsableMessage>;
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

import {
  CompletionStatus,
  Message,
  RegressionModel,
} from "@/services/chat-completion";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/messages/chat-message";
import { IconOpenAI } from "@/components/ui/icons";
import { ring } from "ldrs";
import FlowChart, {
  GptFlowChartResult,
} from "@/components/chat/flows/flow-chart";
import {
  PiDeviceInfo,
  PiMapResponse,
  PiPlotResponse,
} from "@/services/rasberry-pi";
import DeviceCarousel from "@/components/chat/device-carousel/device-carousel";
import { useTheme } from "next-themes";
import MapMessage from "@/components/chat/map/map-message";
import TableMessage from "@/components/chat/table-message/table-message";
import ImageMessage from "@/components/chat/image-message/image-message";
import PlotMessage from "@/components/chat/plots/plot-message";
import CollapsableMessage from "@/components/chat/messages/collapsable-message";

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
      {/* {completionStatus === "GptResponse" ? (
        <Separator className="my-4 md:my-8" />
      ) : null} */}
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

export interface SingleChatProps {
  message: Message;
  index: number;
}

export function SingleChat({ message, index }: SingleChatProps) {
  if (message.role === "tool" && message.ui === "image" && message.data) {
    const src = message.data as string;
    return (
      <div key={index}>
        <CollapsableMessage
          currentIndex={index}
          message={message}
          title="Raspberry Pi Image"
        >
          <ImageMessage src={src} />
        </CollapsableMessage>
        <ChatMessage showIcon={false} hideRating={true} currentIndex={index} message={message} />
      </div>
    );
  }
  if (message.role === "tool" && message.ui === "map" && message.data) {
    const data = message.data as PiMapResponse;
    return (
      <CollapsableMessage currentIndex={index} message={message} title="Map">
        <MapMessage {...data} />;
      </CollapsableMessage>
    );
  }
  if (message.role === "tool" && message.ui === "cards" && message.data) {
    const data = message.data as PiDeviceInfo[];
    return (
      <CollapsableMessage
        currentIndex={index}
        message={message}
        title="Current Devices"
      >
        <DeviceCarousel devices={data} />
      </CollapsableMessage>
    );
  }
  if (message.role === "tool" && message.ui == "plot" && message.data) {
    const data = message.data as PiPlotResponse;
    const poly = RegressionModel(data.data);
    if (poly) {
      message.content = `Here is the **regression models**: \n ${poly}`;
    }
    return (
      <div key={index}>
        <CollapsableMessage
          currentIndex={index}
          message={message}
          title={`Plot of ${data.title} (${data.xLabel} vs ${data.yLabel})`}
        >
          <PlotMessage {...data} />
        </CollapsableMessage>
        <ChatMessage showIcon={false} hideRating={true} currentIndex={index} message={message} />
      </div>
    );
  }
  if (message.role === "tool" && message.ui === "flow-chart" && message.data) {
    const result = message.data as GptFlowChartResult;
    return (
      <CollapsableMessage
        currentIndex={index}
        message={message}
        title="Gpt Flow Chart"
      >
        <FlowChart {...result} />
      </CollapsableMessage>
    );
  }
  if (message.role === "tool" && message.ui === "table" && message.data) {
    const data = message.data as string;
    return (
      <CollapsableMessage currentIndex={index} message={message} title="Table">
        <TableMessage data={data} />
      </CollapsableMessage>
    );
  }
  if (
    (message.role === "assistant" && message.content !== null) ||
    message.role === "user"
  ) {
    return (
      <div key={index}>
        {message.role === "user" && index > 1 && (
          <Separator className="h-[2px] my-2 md:my-4" />
        )}
        <ChatMessage currentIndex={index} message={message} />
        {message.role === "user" && (
          <Separator className="h-[2px] my-2 md:my-4" />
        )}
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
        return <SingleChat key={index} message={message} index={index} />;
      })}
      {isLoading ? (
        <LoadingMessage completionStatus={completionStatus} />
      ) : null}
    </div>
  );
}

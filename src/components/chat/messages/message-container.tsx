"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  GenerateMessageRating,
  GetRndInteger,
  Message,
  MessageAssistant,
  MessageParameter,
  MessageToolCallResponse,
  MessageUser,
} from "@/services/chat-completion";
import { LapTimerIcon, StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import React, { HTMLProps, useState } from "react";
import "./message-container.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatCompletionContext } from "@/lib/context/chat-completion-context";
import { FcInfo } from "react-icons/fc";
import { CiTempHigh } from "react-icons/ci";
import { MdFunctions } from "react-icons/md";
import { RiCharacterRecognitionFill } from "react-icons/ri";
import { BsWechat } from "react-icons/bs";
import { TbSubtask } from "react-icons/tb";
import { TbFunctionFilled } from "react-icons/tb";
import { BsGraphUpArrow } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import { GiCardRandom } from "react-icons/gi";

export interface MessageContainerProps {
  children: React.ReactNode;
  showIcon: boolean;
  message: Message;
  currentIndex: number;
  hideRating?: boolean;
  hideParameter?: boolean;
}

export interface StarGradientIconProps {
  value: number;
  index: number;
  className?: HTMLProps<HTMLElement>["className"];
}

export function StarGradientIcon({
  value,
  index,
  className,
}: StarGradientIconProps) {
  const fillPercent = GetFillValue(value, index);
  const fillValue = `${fillPercent <= 0 ? "0" : fillPercent.toFixed(0)}%`;
  const gardientId = `yellowGreyGradient-${index}-${fillPercent}`;
  return (
    <svg
      className={cn("w-2 h-2 mb-1", className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 22 20"
    >
      <defs>
        <linearGradient id={gardientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={fillValue} stopColor="rgb(234, 179, 8)" />
          <stop offset={fillValue} stopColor="grey" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
        fill={`url(#${gardientId})`}
      />
    </svg>
  );
}

export function GetFillValue(value: number, starIndex: number) {
  const index = starIndex + 1;
  const min = index - 1;
  if (value <= index && value >= min) {
    return (value - min) * 100;
  }
  if (value >= index) {
    return 100;
  } else {
    return 0;
  }
}

export function VerticalRatingStars({ finalRating }: { finalRating: number }) {
  return (
    <div className="flex flex-row items-center">
      {finalRating.toFixed(2) + " •"}

      <div className="ml-1 flex flex-row">
        {Array.from({ length: 3 }, (_, i) => i).map((_, index) => (
          <StarGradientIcon
            className="w-4 h-4 mt-1"
            key={index}
            value={finalRating}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export function HorizantalRatingStars({
  finalRating,
}: {
  finalRating: number;
}) {
  return (
    <div className="flex flex-col mt-1 items-center">
      <p className="hover:underline  text-xs mb-[0.15rem] text-gray-900 dark:text-white">
        {finalRating.toFixed(2)}
      </p>
      <div className="flex flex-row">
        {Array.from({ length: 3 }, (_, i) => i).map((_, index) => (
          <StarGradientIcon
            className="w-[0.6rem] h-[0.6rem]"
            key={index}
            value={finalRating}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export interface LabeledSliderProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
}
export function LabeledSlider({ label, value, setValue }: LabeledSliderProps) {
  return (
    <div className="flex flex-row space-x-1 w-full items-center">
      <p className="flex-none w-[4.55rem] ">{label}</p>
      <Progress className="flex-grow w-full" value={value} />
      <Input
        className="flex-none w-6 h-6 mt-1 mb-1 border rounded-sm text-center p-1"
        type="number"
        min={0}
        max={99}
        defaultValue={value}
        step={2}
        onChange={(val) => {
          setValue(parseInt(val.target.value));
        }}
      ></Input>
    </div>
  );
}

export interface MessageRatingUiProps {
  message: MessageAssistant | MessageToolCallResponse;
  currentIndex: number;
}
import { FaCheckCircle } from "react-icons/fa";
export function MessageRatingUi({
  message,
  currentIndex,
}: MessageRatingUiProps) {
  const [rating, setRating] = useState(message.messageRating);
  const starRating = (rating.finalRating / 100) * 3;
  const { chatCompletion } = useChatCompletionContext();

  const { updateDataBase, messages } = chatCompletion;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-4 w-4 items-center mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <HorizantalRatingStars finalRating={starRating} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Click to view the full rating</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        <CardHeader className="p-0">
          <div className="">
            <CardTitle className="flex">
              <p className="">Rating</p>
              <div className="grow" />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FaCheckCircle className="h-4 w-4 mr-1" />
                {(rating.successRate === undefined
                  ? "0"
                  : rating.successRate.toFixed(1)) + " %"}
                <VerticalRatingStars finalRating={starRating} />
              </div>
            </CardTitle>
            <CardDescription className="flex items-center space-x-2 text-sm text-muted-foreground">
              <>
                <LapTimerIcon className="mr-1 h-5 w-5" />
                {rating.timeTaken.toFixed(1) + "s"}
              </>
              <>
                <TbFunctionFilled className="mr-1 h-5 w-5" />
                {rating.toolsCalled ?? 0 + " tools"}
              </>
              <>
                <RiCharacterRecognitionFill className="mr-1 h-5 w-5" />
                {rating.contextUsed ?? 0 + " characters"}
              </>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-1 text-sm">
          <div className="flex flex-col  items-center">
            <LabeledSlider
              label="Speed"
              value={rating.speed}
              setValue={(val) => {
                if (val > 0) {
                  setRating({
                    ...rating,
                    speed: val,
                    finalRating:
                      (val +
                        rating.accuracy +
                        rating.relevance +
                        rating.efficiency +
                        rating.completion) /
                      5,
                  });
                  message.messageRating = rating;
                }
              }}
            />
            <LabeledSlider
              label="Accuracy"
              value={rating.accuracy}
              setValue={(val) => {
                if (val > 0) {
                  setRating({
                    ...rating,
                    accuracy: val,
                    successRate:
                      (val + rating.relevance + rating.completion) / 3,

                    finalRating:
                      (val +
                        rating.speed +
                        rating.relevance +
                        rating.efficiency +
                        rating.completion) /
                      5,
                  });
                  message.messageRating = rating;
                }
              }}
            />
            <LabeledSlider
              label="Completion"
              value={rating.completion}
              setValue={(val) => {
                if (val > 0) {
                  setRating({
                    ...rating,
                    completion: val,
                    successRate: (rating.accuracy + rating.relevance + val) / 3,
                    finalRating:
                      (val +
                        rating.accuracy +
                        rating.relevance +
                        rating.efficiency +
                        rating.speed) /
                      5,
                  });
                  message.messageRating = rating;
                }
              }}
            />
            <LabeledSlider
              label="Relevance"
              value={rating.relevance}
              setValue={(val) => {
                if (val > 0) {
                  setRating({
                    ...rating,
                    relevance: val,
                    successRate:
                      (rating.accuracy + val + rating.completion) / 3,
                    finalRating:
                      (val +
                        rating.accuracy +
                        rating.speed +
                        rating.efficiency +
                        rating.completion) /
                      5,
                  });
                  message.messageRating = rating;
                }
              }}
            />

            <LabeledSlider
              label="Effieciency"
              value={rating.efficiency}
              setValue={(val) => {
                if (val > 0) {
                  setRating({
                    ...rating,
                    efficiency: val,

                    finalRating:
                      (val +
                        rating.accuracy +
                        rating.relevance +
                        rating.speed +
                        rating.completion) /
                      5,
                  });
                  message.messageRating = rating;
                }
              }}
            />
            <Button
              onClick={async () => {
                message.messageRating = rating;
                messages[currentIndex] = message;
                await updateDataBase(messages);
              }}
              className="mt-2"
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </PopoverContent>
    </Popover>
  );
}

export interface MessageParameterUiProps {
  message: MessageUser;
  currentIndex: number;
}

export interface MessageParamLabelProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  valueClassName?: React.HtmlHTMLAttributes<HTMLDivElement>["className"];
}

export function MessageParamLabel({
  icon,
  label,
  value,
  valueClassName,
}: MessageParamLabelProps) {
  return (
    <div className="flex h-[35px] flex-row space-x-1 w-full items-center">
      <div className="w-fit ">{icon}</div>
      <div className="ml-1 flex-none w-fit ">{label}</div>
      <div className="flex-grow w-full" />
      <p
        className={cn(
          "flex-none h-6 w-[60px] text-center text-sm font-bold bg-primary text-primary-foreground shadow rounded-md whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-clip",
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function MessageParameterUi({
  message,
  currentIndex,
}: MessageParameterUiProps) {
  const msgParam: MessageParameter | undefined = message.messageParameter;
  return msgParam !== undefined ? (
    <Popover>
      <PopoverTrigger asChild>
        <button className="items-center ">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <IconUser className="shadow border bg-background rounded-md hover:border-slate-500 dark:hover:border-gray-300" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Click to view the full details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[270px] ">
        <CardHeader className="p-0">
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <Separator className="mt-2 mb-2" />
        <CardContent className="flex flex-col p-0 text-sm">
          <MessageParamLabel
            label="Character Size"
            icon={<RiCharacterRecognitionFill className="w-6 h-6" />}
            value={msgParam.characterSize}
          />
          <MessageParamLabel
            label="Complexity"
            icon={<BsGraphUpArrow className="w-6 h-6" />}
            value={msgParam.taskComplexity}
          />
          <Separator className="mt-1 mb-1" />
          <MessageParamLabel
            label="Generated Context"
            icon={<BsWechat className="w-6 h-6" />}
            value={msgParam.generatedContext}
          />
          <MessageParamLabel
            label="Called Tools"
            icon={<TbFunctionFilled className="w-6 h-6" />}
            value={msgParam.calledTools}
          />
          <MessageParamLabel
            label="Total Time"
            icon={<LapTimerIcon className="w-6 h-6" />}
            value={msgParam.totalTime}
          />
        </CardContent>
      </PopoverContent>
    </Popover>
  ) : null;
}

export default function MessageContainer({
  children,
  showIcon,
  message,
  currentIndex,
  hideParameter,
  hideRating,
  ...props
}: MessageContainerProps) {
  const isUser = message.role === "user";
  const { chatCompletion } = useChatCompletionContext();
  const { updateDataBase, isEvaluation } = chatCompletion;
  if (
    (message.role === "assistant" || message.role === "tool") &&
    message.messageRating === undefined
  ) {
    message.messageRating = GenerateMessageRating();
  }

  if (message.role === "user" && message.messageParameter === undefined) {
    message.messageParameter = {
      totalTime: GetRndInteger(0, 100),
      calledTools: GetRndInteger(0, 10),
      characterSize: GetRndInteger(0, 10),
      taskComplexity: GetRndInteger(0, 10),
      generatedContext: GetRndInteger(0, 10),
    };
  }

  return (
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12")}
      {...props}
    >
      <div
        className={cn(
          "flex size-8 mt-[0.23rem] shrink-0 select-none items-center justify-center",
          showIcon && isUser ? "" : ""
        )}
      >
        {showIcon && !isUser ? (
          <div className="flex flex-col items-center">
            <IconOpenAI className="rounded-md shadow border bg-primary text-primary-foreground " />
            {(message.role === "assistant" || message.role === "tool") &&
            (hideRating === undefined || hideRating === false) &&
            isEvaluation ? (
              <MessageRatingUi currentIndex={currentIndex} message={message} />
            ) : null}
          </div>
        ) : null}
        {showIcon && isUser ? (
          message.role === "user" &&
          message.messageParameter !== undefined &&
          (hideParameter === undefined || hideParameter === false) ? (
            <MessageParameterUi currentIndex={currentIndex} message={message} />
          ) : (
            <IconUser className="shadow border bg-background rounded-md" />
          )
        ) : null}
        {!showIcon && <div className="h-4 w-4" />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

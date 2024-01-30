"use client";

import { useChat, type Message } from "ai/react";

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
import {toast} from "sonner";
import { ChatCompletionCreateParams, ChatCompletionFunctionCallOption } from "openai/resources/index.mjs";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

const functions: Array<ChatCompletionCreateParams.Function> = [
  {
    name: "plot-data",
    description: "Plots and shows a line chart when user asks you will not show the plot instead you will ONLY mention to the user that the plot has been shown above",
  },
  {
    name: "get_current_weather",
    description: "Gets the current weather",
  }
]

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

  const { messages, append, reload, stop, isLoading, input, setInput, handleInputChange, handleSubmit, data, setMessages } =
    useChat({
      api: '/api/chat',
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        functions
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText);
        }
        console.log("OnResponse: ",messages.length)

      },
      
      async onFinish(message) {
        // if (!path.includes('chat')) {
        //   window.history.pushState({}, '', `/chat/${id}`)
        // }
        console.log("Before OnCompletion: ",messages.length)
        messages.push(message)

        // message.content += " (Finished)";
        // console.log(messages[messages.length - 1])
        // messages.push(message)
        // console.log(message);
        // if(messages.length > 0 && messages[messages.length - 1].role === "assistant"){
          // messages[messages.length - 1].content += " (Finished)";
          // message.content += " (Finished)";
          // await reload();
          // append(message);                
        // }
        // setMessages(messages);
        console.log("After OnCompletion: ",messages.length)

      },
      onError(error) {
          toast.error(error.message)
      },
      async experimental_onFunctionCall(chatMessages, functionCall) {
        if (functionCall.name === 'get_current_weather') {
          if (functionCall.arguments) {
            const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
            console.log(parsedFunctionCallArguments);
          }
       
          // Generate a fake temperature
          const temperature = Math.floor(Math.random() * (100 - 30 + 1) + 30);
          // Generate random weather condition
          const weather = ['sunny', 'cloudy', 'rainy', 'snowy'][
            Math.floor(Math.random() * 4)
          ];
       
          const functionResponse: ChatRequest = {
            messages: [
              ...chatMessages,
              {
                id: nanoid(),
                name: 'get_current_weather',
                role: 'function' as const,
                data: {
                  x: [1, 2, 3],
                  y: [1, 2, 3],
                },
                content: JSON.stringify({
                  temperature,
                  weather,
                  info: 'This data is randomly generated and came from a fake weather API!',
                }),
              },
            ],
          };
          return functionResponse;
        }
        else if(functionCall.name === "plot-data" ){
          const functionResponse: ChatRequest = {
            messages: [
              ...chatMessages,
              {
                id: nanoid(),
                name: 'plot-data',
                role: 'function' as const,
                content: JSON.stringify({
                  x: [1, 2, 3],
                  y: [1, 2, 3],
                  info: 'The plot has been ALREADY shown the user, just inform the user it is shown above',
                }),
              },
            ],
          };
          return functionResponse;
        }
      },
    });

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
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

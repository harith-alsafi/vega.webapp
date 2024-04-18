"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { PromptForm } from "@/components/chat/messages/prompt-form";
import { ButtonScrollToBottom } from "@/components/chat/messages/button-scroll-to-bottom";
import { IconRefresh, IconStop } from "@/components/ui/icons";
import { Message, MessageUser } from "@/services/chat-completion";
import { ChatCompletion } from "@/services/chat-completion";
import { useConnectionContext } from "@/lib/context/connection-context";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ChatPanelProps
  extends Pick<
    ChatCompletion,
    | "append"
    | "isLoading"
    | "reload"
    | "messages"
    | "stop"
    | "input"
    | "setInput"
    | "setMessages"
  > {
  id?: string;
  title?: string;
}

export function ChatPanel({
  id,
  title,
  isLoading,
  setMessages,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
}: ChatPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { connectionState } = useConnectionContext();
  const isConnected = connectionState.status;

  // if(!connectionState.status){
  //   return null
  // }

  return (
    <div className=" mb-0 fixed inset-x-0 bottom-0 w-full bg-transparent peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] z-0">
      {/* // <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]"> */}
      <ButtonScrollToBottom />
      {/* <div className="mx-auto sm:max-w-2xl sm:px-4 bg-transparent" >
        <div className="flex bg-transparent items-center justify-center h-12"> */}
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex items-center justify-center h-12">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 &&
            isConnected && (
              <div className="flex space-x-2">
                <Button
                  className="bg-background"
                  variant="outline"
                  onClick={() => reload()}
                >
                  <IconRefresh className="mr-2" />
                  Regenerate response
                </Button>
              </div>
            )
          )}
        </div>
        {/* <div className="bg-background px-4 py-2 space-y-4 border-t shadow-lg  sm:rounded-t-xl sm:border md:py-4"> */}
        <div className="px-4 py-2 md:mr-6 sm:mr-0 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4 z-0">
          <PromptForm
            onSubmit={async (value) => {
              if (!connectionState.status) {
                setIsOpen(true);
                return;
              }
              const msg: MessageUser = {
                content: value,
                role: "user",
              };
              await append(msg);
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              There is no connected Raspberry Pi!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please make sure you are connected to a Raspberry Pi before trying
              to send a message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center">
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

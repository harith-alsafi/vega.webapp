"use client";
import { ChatCompletion } from "@/services/chat-completion";
import { createContext, useContext, useState } from "react";

export interface ChatCompletionContextProp {
  chatCompletion: ChatCompletion;
}

const ChatCompletionContext = createContext<ChatCompletionContextProp | null>(
  null
);

interface ChatCompletionProviderProps {
  children: React.ReactNode;
  chatCompletion: ChatCompletion;
}

export function ChatCompletionProvider({
  children,
  chatCompletion,
}: ChatCompletionProviderProps) {
  const [chatCompletionState, setChatCompletionState] =
    useState<ChatCompletion>(chatCompletion);

  return (
    <ChatCompletionContext.Provider
      value={{ chatCompletion: chatCompletionState }}
    >
      {children}
    </ChatCompletionContext.Provider>
  );
}

export function useChatCompletionContext() {
  const context = useContext(ChatCompletionContext);
  if (!context) {
    throw new Error(
      "useChatCompletionContext must be used within a ChatCompletionProvider"
    );
  }
  return context;
}

"use client";
import { toast } from "sonner";
import { useConnectionContext } from "@/lib/context/connection-context";
import { nanoid } from "@/lib/utils";
import {
  DefaultOnToolCall,
  Message,
  useChat,
} from "@/services/chat-completion";
import { usePathname } from "next/navigation";
import { ChatCompletionTool } from "openai/resources";
import { useState } from "react";

export default function Page() {
  
  const testingMessages:Array<Message[]> = [];  
  const id = nanoid();
  const initialMessages: Message[] = [];
  const { connectionState } = useConnectionContext();
  const tools = connectionState.tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  })) as Array<ChatCompletionTool>;
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
    onError(error) {
      console.log("messages error", messages);
      toast.error(error.message);
    },
    async onToolCall(oldMessages, toolCalls) {
      return await DefaultOnToolCall(
        connectionState,
        tools,
        oldMessages,
        toolCalls
      );
    },
  });
}

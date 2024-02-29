// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from "@/services/chat-completion";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/chat/messages/markdown";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { ChatMessageActions } from "@/components/chat/messages/chat-message-actions";

export interface ChatMessageProps {
  message: Message;
}

export function Test() {
  return( 
  <div className="group relative mb-4 flex items-start md:-ml-12">
    <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground">
    <IconOpenAI />
    </div>
    <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
      <div className="flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0">


      </div>
    </div>
  </div>
  
  );
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    // <div className="relative mx-auto max-w-2xl px-4">
    //   <div
    //     className={cn("group relative mb-4 flex items-start md:-ml-12")}
    //     {...props}
    //   >
    //     <div
    //       className={cn(
    //         "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
    //         message.role === "user"
    //           ? "bg-background"
    //           : "bg-primary text-primary-foreground"
    //       )}
    //     >
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12")}
      {...props}
    >
      <div
        className={cn(
          "flex size-8 mt-[0.23rem] shrink-0 select-none items-center justify-center rounded-md border shadow",
          message.role === "user"
            ? "bg-background"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message.role === "user" ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            // a: (props) => (
            //   <a {...props} target="_blank" rel="noopener noreferrer" />
            // ),
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");

              return match ? (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content as string}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
      {/* </div> */}
    </div>
  );
}

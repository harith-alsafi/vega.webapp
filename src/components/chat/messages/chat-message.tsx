// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from "@/services/chat-completion";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/chat/messages/markdown";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { ChatMessageActions } from "@/components/chat/messages/chat-message-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
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
          rehypePlugins={[rehypeKatex]}
          components={{
            a: ({ children, href }) => (
              <Link
                className="underline underline-offset-4 hover:text-primary"
                href={href ?? "/"}
              >
                {children}
              </Link>
            ),
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
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = (match && match[1]) || "";
              if (language === "math") {
                return null;
              }
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
    </div>
  );
}

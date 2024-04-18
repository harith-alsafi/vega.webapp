// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { GenerateMessageRating, Message } from "@/services/chat-completion";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/chat/messages/markdown";
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
import MessageContainer from "@/components/chat/messages/message-container";

export interface ChatMessageProps {
  message: Message;
  showIcon?: boolean;
  currentIndex: number;
}

export function ChatMessage({ message, showIcon, currentIndex, ...props }: ChatMessageProps) {
  return (
    <MessageContainer currentIndex={currentIndex}  message={message} showIcon={showIcon ?? true} {...props}>
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
      <ChatMessageActions className="hidden md:block" message={message} />
    </MessageContainer>
  );
}

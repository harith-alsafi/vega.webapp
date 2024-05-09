import React from "react";
import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface TableMessageProps {
  data: string;
}

export default function TableMessage({ data }: TableMessageProps) {
  return (
    <div className="flex justify-center items-center">
      <MemoizedReactMarkdown
        className="w-full   prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
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
            <TableRow className="border-b text-center">{children}</TableRow>
          ),
          table: ({ children }) => (
            <div className="rounded-md border ">
              <Table className="mt-0 mb-0">{children}</Table>
            </div>
          ),
        }}
      >
        {data}
      </MemoizedReactMarkdown>
    </div>
  );
}

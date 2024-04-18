import React from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MessageContainer from "@/components/chat/messages/message-container";
import { Message, MessageToolCallResponse } from "@/services/chat-completion";

export interface CollapsableMessageProps {
  title: string;
  children: React.ReactNode;
  message: MessageToolCallResponse;
  currentIndex: number;
}

export function CollapsableContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-1 pr-2 mb-3 ">
      <Accordion type="single" collapsible className="w-full" defaultValue="1">
        <AccordionItem defaultChecked={true} className="border-b-0" value="1">
          <AccordionTrigger>
            <div className="">
              <h3 className="flex items-center justify-between font-semibold ml-3.5">
                {title}
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export default function CollapsableMessage({
  title,
  children,
  message,
  currentIndex,
}: CollapsableMessageProps) {
  return (
    <MessageContainer
      currentIndex={currentIndex}
      message={message}
      showIcon={true}
    >
      <CollapsableContainer title={title}>{children}</CollapsableContainer>
    </MessageContainer>
  );
}

import React from "react";
import { Card } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import MessageContainer from "@/components/chat/messages/message-container";


export interface CollapsableMessageProps {
  title: string;
  children: React.ReactNode;
}

export default function CollapsableMessage({
  title,
  children,
}: CollapsableMessageProps) {

  return (
    <MessageContainer isUser={false} showIcon={true}>
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
    </MessageContainer>

  );
}

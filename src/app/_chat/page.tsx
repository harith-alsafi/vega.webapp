"use client"

import { Chat } from "@/components/chat";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { ChatCard } from "@/components/chat/chat-card";
import { EmptyScreen } from "@/components/empty-screen";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, nanoid } from "@/lib/utils";
import { Dialog } from "@radix-ui/react-dialog";

import { Message } from 'ai'



const messages:Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Hi, how can I help you today?",
      },
      {
        id: "2",
        role: "user",
        content: "Hey, I'm having trouble with my account.",
      },
      {
        id: "3",
        role: "assistant",
        content: "What seems to be the problem?",
      },
      {
        id: "4",
        role: "user",
        content: "I can't log in.",
      },
];

export default function ChatPage() {
  const id = nanoid()

return <Chat  id={id}/>
}
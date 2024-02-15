import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
// import { auth } from '@/auth'
import { clearChats } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sidebar } from "@/components/chat/panel/sidebar";
import { SidebarList } from "@/components/chat/panel/sidebar-list";
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel,
} from "@/components/ui/icons";
import { SidebarFooter } from "@/components/chat/panel/sidebar-footer";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { ClearHistory } from "@/components/chat/messages/clear-history";
import { UserMenu } from "@/components/user-menu";
import { SidebarMobile } from "../chat/panel/sidebar-mobile";
import { SidebarToggle } from "../chat/panel/sidebar-toggle";
import { ChatHistory } from "../chat/messages/chat-history";
import { TabsPanel } from "./top-bar/tabs-panel";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionSelector } from "./connection/connection-selector";

export function RaspberryPiConnect() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Connection</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
          <DialogDescription>
            Make changes to the current connection of the raspberry pi
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center space-x-2">
        <SidebarMobile>
          <ChatHistory />
        </SidebarMobile>
        <SidebarToggle />
        <ConnectionSelector />  
        <TabsPanel />
      </div>
      <div className="flex items-center justify-end space-x-2">
        {/* <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a> */}
        <RaspberryPiConnect />
        <ThemeToggle />
      </div>
    </header>
  );
}

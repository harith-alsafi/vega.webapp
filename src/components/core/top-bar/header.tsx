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
import { ThemeToggle } from "@/components/core/top-bar/theme-toggle";
import { ClearHistory } from "@/components/chat/messages/clear-history";
import { UserMenu } from "@/components/user-menu";
import { SidebarMobile } from "../../chat/panel/sidebar-mobile";
import { SidebarToggle } from "../../chat/panel/sidebar-toggle";
import { ChatHistory } from "../../chat/messages/chat-history";
import { TabsPanel } from "./tabs-panel";

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
import { ConnectionSelector } from "./connection-selector";

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

import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CommandBox } from "./command-box";
import ConnectionDialog from "./connection-dialog";

export function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <FaceIcon className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <RocketIcon className="mr-2 h-4 w-4" />
            <span>Launch</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <PersonIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
            <span>Mail</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <GearIcon className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
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
        {/* <ConnectionSelector />   */}
        <ConnectionDialog />
        {/* <Button variant="outline">Schematic</Button>  */}
        {/* <Button variant="outline">Functions</Button> */}
      </div>
      {/* <TabsPanel /> */}
      {/* <CommandDemo /> */}
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
        <CommandBox />

        {/* <RaspberryPiConnect /> */}
        <ThemeToggle />
      </div>
    </header>
  );
}

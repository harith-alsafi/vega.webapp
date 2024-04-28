import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/core/top-bar/theme-toggle";
import { SidebarMobile } from "@/components/chat/panel/sidebar-mobile";
import { SidebarToggle } from "@/components/chat/panel/sidebar-toggle";
import { ChatHistory } from "@/components/chat/messages/chat-history";
import ConnectionDialog from "@/components/core/top-bar/connection-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoMdHelpCircleOutline } from "react-icons/io";
import {
  QuestionMarkCircledIcon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";
import { PiMarkerCircle, PiMarkerCircleThin } from "react-icons/pi";
import Link from "next/link";

export interface KeyboardKeyProps {
  shortcuts: Array<string>;
  description: string;
}

export function KeyboardKey({ shortcuts, description }: KeyboardKeyProps) {
  return (
    <div className="flex flex-row align-middle">
      {shortcuts.map((shortcut, index) => (
        <div key={index}>
          <kbd
            key={index}
            className="inline-block p-1 text-xs bg-gray-200 dark:bg-slate-700 rounded"
          >
            {shortcut}
          </kbd>
          {index < shortcuts.length - 1 && <span className="mx-1">+</span>}
        </div>
      ))}
      <p className="ml-2">{description}</p>
    </div>
  );
}

export function HelpPopup() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QuestionMarkCircledIcon className="h-4 w-4 lg:mr-1" />
          <p className="hidden lg:block">Help</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Help</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>This is some documentation</p>
        </DialogDescription>
        <div className="text-sm flex-col flex space-y-1 align-middle">
          <KeyboardKey
            shortcuts={["Ctrl", "U"]}
            description="Stops the current message"
          />
          <KeyboardKey
            shortcuts={["Ctrl", "Q"]}
            description="Regenerates the current message"
          />
          <KeyboardKey
            shortcuts={["Ctrl", "K"]}
            description="Shows the evaluation result"
          />
          <KeyboardKey
            shortcuts={["Ctrl", "N"]}
            description="Shifts to the next message in evaluation"
          />
          <KeyboardKey
            shortcuts={["Ctrl", "I"]}
            description="Lunches information of current chat"
          />
          <KeyboardKey
            shortcuts={["Ctrl", "Shift", "S"]}
            description="Saves current chat as JSON file"
          />
        </div>
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
        <ConnectionDialog />
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button asChild variant="outline">
          <Link href="/evaluation">
          <PiMarkerCircle className="h-4 w-4 lg:mr-1" />
          <p className="hidden lg:block">Evaluation</p>
          </Link>
        </Button>
        <HelpPopup />
        <ThemeToggle />
      </div>
    </header>
  );
}

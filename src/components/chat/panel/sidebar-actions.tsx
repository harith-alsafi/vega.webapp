"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconSpinner, IconTrash } from "@/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Chat } from "@/services/chat-completion";
import { RemoveChat, UpdateChat } from "@/services/database";
import { emitUpdateSidebarEvent } from "@/lib/event-emmiter";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SidebarActionsProps {
  chat: Chat;
  removeChat: (id: string, path: string) => Promise<any>;
}

export function SidebarActions({ chat, removeChat }: SidebarActionsProps) {
  const path = usePathname();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [changeTitleDialogOpen, setChangeTitleDialogOpen] =
    React.useState(false);

  const isActive = path === chat.path;

  const [isRemovePending, startRemoveTransition] = React.useTransition();
  const [chatTitle, setChatTitle] = React.useState(chat.title);

  return isActive && (
    <>
      <div className="space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setChangeTitleDialogOpen(true)}
            >
              <Pencil2Icon className="mr-2" />
              <span className="sr-only">Rename</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rename chat</TooltipContent>
        </Tooltip>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={(event) => {
                event.preventDefault();
                // @ts-ignore
                startRemoveTransition(async () => {
                  await RemoveChat(chat.id, chat.path);
                  setDeleteDialogOpen(false);
                  if (path.includes(`/chat/[id]`)) {
                    router.refresh();
                    router.push("/");
                  }
                  toast.success("Chat deleted");
                  emitUpdateSidebarEvent();
                });
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={changeTitleDialogOpen}
        onOpenChange={setChangeTitleDialogOpen}
      >
        <DialogContent className="sm:max-w-[375px]">
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
            <DialogDescription>Change the title of the chat</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col -mt-2 items-center justify-center">
            <Input
              id="title"
              value={chatTitle}
              onChange={(event) => {
                setChatTitle(event.target.value);
              }}
            />
            <div className="w-full justify-end mt-2 flex">
              <Button
                className="w-fit"
                onClick={async () => {
                  setChangeTitleDialogOpen(false);
                  chat.title = chatTitle;
                  await UpdateChat(chat);
                  emitUpdateSidebarEvent();
                }}
                type="submit"
              >
                Save changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

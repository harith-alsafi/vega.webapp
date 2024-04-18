"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { IconMessage, IconSpinner, IconTrash } from "@/components/ui/icons";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { Chat } from "@/services/chat-completion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil2Icon } from "@radix-ui/react-icons";
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
import { emitUpdateSidebarEvent } from "@/lib/event-emmiter";
import { RemoveChat, UpdateChat } from "@/services/database";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SidebarItemProps {
  index: number;
  chat: Chat;
}

export function SidebarItem({ index, chat }: SidebarItemProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname === chat.path;
  const [newChatId, setNewChatId] = useLocalStorage("newChatId", null);
  const shouldAnimate = index === 0 && isActive && newChatId;
  const [isHovered, setIsHovered] = React.useState(false);

  const [isRemovePending, startRemoveTransition] = React.useTransition();
  const [chatTitle, setChatTitle] = React.useState(chat.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [changeTitleDialogOpen, setChangeTitleDialogOpen] =
    React.useState(false);

  if (!chat?.id) return null;

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-8"
      variants={{
        initial: {
          height: 0,
          opacity: 0,
        },
        animate: {
          height: "auto",
          opacity: 1,
        },
      }}
      initial={shouldAnimate ? "initial" : undefined}
      animate={shouldAnimate ? "animate" : undefined}
      transition={{
        duration: 0.25,
        ease: "easeIn",
      }}
    >
      <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
        <IconMessage className="mr-2" />
      </div>
      <Link
        href={chat.path}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group w-full px-8 transition-color pr-16 hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10",
          isHovered && "bg-zinc-200/40 dark:bg-zinc-300/10",
          isActive && "bg-zinc-200 font-semibold dark:bg-zinc-800"
        )}
      >
        <div
          className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="overflow-clip whitespace-nowrap">
            {shouldAnimate ? (
              chat.title.split("").map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -100,
                    },
                    animate: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  initial={shouldAnimate ? "initial" : undefined}
                  animate={shouldAnimate ? "animate" : undefined}
                  transition={{
                    duration: 0.25,
                    ease: "easeIn",
                    delay: index * 0.05,
                    staggerChildren: 0.05,
                  }}
                  onAnimationComplete={() => {
                    if (index === chat.title.length - 1) {
                      setNewChatId(null);
                    }
                  }}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <span>{chat.title}</span>
            )}
          </span>
        </div>
      </Link>
      <div className="absolute right-2 top-1">
        {isHovered || isActive ? (
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
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your chat message and remove
                    your data from our servers.
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
                        if (pathname.includes(`/chat/[id]`)) {
                          router.refresh();
                          router.push("/");
                        }
                        toast.success("Chat deleted");
                        emitUpdateSidebarEvent();
                      });
                    }}
                  >
                    {isRemovePending && (
                      <IconSpinner className="mr-2 animate-spin" />
                    )}
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
                  <DialogDescription>
                    Change the title of the chat
                  </DialogDescription>
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
        ) : null}
      </div>
    </motion.div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";


import { SidebarActions } from "@/components/chat/panel/sidebar-actions";
import { SidebarItem } from "@/components/chat/panel/sidebar-item";
import { Chat } from "@/services/chat-completion";
import { RemoveChat } from "@/services/database";

interface SidebarItemsProps {
  chats?: Chat[];
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  if (!chats?.length) return null;

  return (
    <AnimatePresence>
      {chats.map(
        (chat, index) =>
          chat && (
            <motion.div
              key={chat?.id}
              exit={{
                opacity: 0,
                height: 0,
              }}
            >
              <SidebarItem index={index} chat={chat}>
                <SidebarActions chat={chat} removeChat={RemoveChat} />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  );
}
"use client";
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { sideBarEventEmitter, subscribeToUpdateSidebarEvent, updateSidebarEvent } from '@/lib/event-emmiter'
import { Chat } from '@/services/chat-completion'
import { ClearChats, GetChats } from '@/services/database'
import EventEmitter from 'events';
import { cache, useEffect, useState } from 'react'

interface SidebarListProps {
  children?: React.ReactNode
}

const loadChats = cache(async () => {
  return await GetChats()
})

export function SidebarList(props : SidebarListProps) {
  // const currentChats = await loadChats()

  const [chats, setChats] = useState<Chat[]>([]);


  useEffect(() => {
    const handleUpdateSidebar = async () => {
      // Reload or fetch new data when the event occurs
      const updatedChats = await loadChats();
      setChats(updatedChats);
      // Update state or do anything else with the updated data
    };

    // Subscribe to the event when the component mounts
    subscribeToUpdateSidebarEvent(handleUpdateSidebar);
    
    handleUpdateSidebar();

    // Unsubscribe when the component unmounts
    return () => {
      // EventEmitter.off(updateSidebarEvent, handleUpdateSidebar);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ClearHistory clearChats={ClearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}

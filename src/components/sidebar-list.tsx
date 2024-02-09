import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ClearChats, GetChats } from '@/services/database'
import { cache } from 'react'

interface SidebarListProps {
  children?: React.ReactNode
}

const loadChats = cache(async () => {
  return await GetChats()
})

export async function SidebarList(props : SidebarListProps) {
  const chats = await loadChats()
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

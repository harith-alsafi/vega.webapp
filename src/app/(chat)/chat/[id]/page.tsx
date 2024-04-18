import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GetChat } from '@/services/database'
import { Chat } from '@/components/chat/messages/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {

  const chat = await GetChat(params.id)
  return {
    title: chat?.title?.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const chat = await GetChat(params.id)

  if (!chat) {
    notFound()
  }

  return <Chat id={chat.id} title={chat.title} initialMessages={chat.messages} />
}
import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import ChartMessage from './chat/message/chart-message'

export interface ChatList {
  messages: Message[]
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        if(message.role === 'function'){
          // console.log(message)
        }
        return (message.role === 'assistant' && message.function_call == null )|| message.role === "user" ? (
          <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
        ) : (
        message.role === 'function' && message.function_call !== null && message.function_call == "plot-data"?
        <div key={index}>
          <ChartMessage/>
        </div> : null)
      })}
    </div>
  )
}

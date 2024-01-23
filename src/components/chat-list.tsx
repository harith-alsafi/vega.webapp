import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import ChartMessage from './chat/message/chart-message'

export interface ChatList {
  messages: Message[]
}

export function SingleChat({message, index, maxLength}: {message: Message, index: number, maxLength: number}){
  if(message.role === 'function' && message.name == "plot-data"){
    return <div key={index}> <ChartMessage/> </div>
  }
  else if(message.role === 'function' && message.name == "get_current_weather"){
    return <div key={index}> <h1> Weather </h1> </div>
  }
  else if((message.role === 'assistant' && message.function_call == null )|| message.role === "user"){
    return  <div key={index}>
      <ChatMessage message={message} />
    {index < maxLength - 1 && (
      <Separator className="my-4 md:my-8" />
    )}
    </div>
  }
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        return <SingleChat key={index} message={message} index={index} maxLength={messages.length}/>
        // if(message.role === 'function'){
        //   // console.log(message)
        // }
        // return (message.role === 'assistant' && message.function_call == null )|| message.role === "user" ? (
        //   <div key={index}>
        //   <ChatMessage message={message} />
        //   {index < messages.length - 1 && (
        //     <Separator className="my-4 md:my-8" />
        //   )}
        // </div>
        // ) : (
        // message.role === 'function' && message.name == "plot-data"?
        // <div key={index}>
        //   <ChartMessage/>
        // </div> : null)
      })}
    </div>
  )
}

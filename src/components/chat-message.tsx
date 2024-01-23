// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { JSONValue, Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import ChartMessage from './chat/message/chart-message'

export interface ChatMessageProps {
  message: Message
}

export interface Data{
  x: number[],
  y: number[],
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  let data: Data | null = null
  if(message.role === "assistant" && message.data != null){
    const jsonData = message.data as object
    if(jsonData !== null){
      const tempData = jsonData as Data
      if(tempData !== null && tempData.x.length > 0 && tempData.y.length > 0){
        data = tempData
        console.log(data)
      }
    }
  }
  
  return (
    <div className='relative mx-auto max-w-2xl px-4'>
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            // a: (props) => (
            //   <a {...props} target="_blank" rel="noopener noreferrer" />
            // ),
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, className, children, ...props }) {
              // if (children != null && children.length) {
              //   if (children[0] == '▍') {
              //     return (
              //       <span className="mt-1 cursor-default animate-pulse">▍</span>
              //     )
              //   }

              //   children[0] = (children[0] as string).replace('`▍`', '▍')
              // }

              const match = /language-(\w+)/.exec(className || '')
         
              // if (inline) {
                return match ? (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
              // }

              // return (
              //   <CodeBlock
              //     key={Math.random()}
              //     language={(match && match[1]) || ''}
              //     value={String(children).replace(/\n$/, '')}
              //     {...props}
              //   />
              // )
            }
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
    {data !== null ? <ChartMessage/>: null}


    </div>
  )
}

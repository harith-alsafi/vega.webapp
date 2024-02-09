import { kv } from '@vercel/kv'
import { AIStream, Message, OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { nanoid } from '@/lib/utils'
import { Chat } from '@/lib/types'

// export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken, functions } = json

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true,
    function_call: "auto",
    functions: functions
  }, )

  const stream = OpenAIStream(res, {
    // async onCompletion(completion) {
    //   const title = json.messages[0].content.substring(0, 100)
    //   const id = json.id ?? nanoid()
    //   const createdAt = Date.now()
    //   const path = `/chat/${id}`
    //   const payload:Chat = {
    //     id,
    //     title,
    //     // userId,
    //     userId: 'me',
    //     createdAt,
    //     path,
    //     messages: [
    //       ...messages,
    //       {
    //         content: completion,
    //         role: 'assistant'
    //       }
    //     ]
    //   }
    //   await kv.hmset(`chat:${id}`, payload)
    // }
  })

  return new StreamingTextResponse(stream)
}
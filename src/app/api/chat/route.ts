import { kv } from '@vercel/kv'
import { AIStream, Message, OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { nanoid } from '@/lib/utils'
import { Chat } from '@/lib/types'
import { ChatCompletionChunk } from 'openai/resources/index.mjs'
import { Stream } from 'openai/streaming.mjs'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  // const userId = (await auth())?.user.id

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  // const response = await fetch('https://api.openai.com/v1/completions', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       {
  //         role: 'user',
  //         content: 'Hello, how are you?'
  //       }
  //     ],
  //     temperature: 0.7,
  //     stream: true,
  //   }),
  // });

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true,
    function_call: "auto",
    functions:[
      {
        name: "plot-data",
        description: "Plots and shows a line chart when user asks you will not show the plot instead you will ONLY mention to the user that the plot has been shown above",
      },
      {
        name: "get_current_weather",
        description: "Gets the current weather",
      }
    ]
  }, )


  // const response = await fetch("");
  // res 

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload:Chat = {
        id,
        title,
        // userId,
        userId: 'me',
        createdAt,
        path,
        messages: [
          ...messages,
          {
            
            content: completion,
            role: 'assistant'
          }
        ]
      }
      
      await kv.hmset(`chat:${id}`, payload)
      completion = "Hi"
      // await kv.set(`chat:${id}`, payload)
      // await kv.zadd(`user:chat:me`, {
        // score: createdAt,
        // member: `chat:${id}`
      // })
    }
  })

  return new StreamingTextResponse(stream)
}
import { kv } from '@vercel/kv'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
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

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true,
    function_call: "auto",
    functions:[
      {
        name: "plot-data",
        description: "Plots and shows a line chart without any need of data, used when user asks to plot a line chart",
        // parameters: {
        //   type: "object",
        //   properties: {
        //     x: {
        //       type: "Array<number>",
        //       description: "Array of x values given as [1, 2, 3 .. etc]",
        //     },
        //     y: {
        //       type: "Array<number>",
        //       description: "Array of y values given as [1, 2, 3 .. etc]",
        //     },
        //   },
        // },
      }
    ]
  }, )


  const title = json.messages[0].content.substring(0, 100)
  const id = json.id ?? nanoid()
  const createdAt = Date.now()
  const path = `/chat/${id}`
  // const payload:Chat = {
  //   id,
  //   title,
  //   // userId,
  //   userId: 'me',
  //   createdAt,
  //   path,
  //   messages: [
  //     ...messages,
  //     {
  //       content: res.choices[0].message.content,
  //       function_call: res.choices[0].message.function_call,
  //       data: {
  //         x: [1, 2, 3],
  //         y: [1, 2, 3]
  //       },
  //       role: 'assistant'
  //     }
  //   ]
  // }

  const stream = OpenAIStream(res, {
    async experimental_onFunctionCall( { name, arguments: args }, createFunctionCallMessages) {
      const newMessages = createFunctionCallMessages({
        info: "Plotting data now..."
      });
      newMessages.push({
        // id: id,
        name: name,
        content: "Plotting data now...",
        role: "assistant",
        
        // createdAt: new Date(),
        // data: {
        //   x: [1, 2, 3],
        //   y: [1, 2, 3]
        // }
      });
      // newMessages[newMessages.length-1].data = {
      //   x: [1, 2, 3],
      //   y: [1, 2, 3]
      // }
      // console.log(newMessages)
      
      return openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [...messages, ...newMessages],
        temperature: 0.7,
        stream: true,
        function_call: "auto",
        functions:[
          {
            name: "plot-data",
            description: "Plots and shows a line chart without any need of data, used when user asks to plot a line chart",
            // parameters: {
            //   type: "object",
            //   properties: {
            //     x: {
            //       type: "Array<number>",
            //       description: "Array of x values given as [1, 2, 3 .. etc]",
            //     },
            //     y: {
            //       type: "Array<number>",
            //       description: "Array of y values given as [1, 2, 3 .. etc]",
            //     },
            //   },
            // },
          }
        ]
      });
    },
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
      // await kv.set(`chat:${id}`, payload)
      // await kv.zadd(`user:chat:me`, {
        // score: createdAt,
        // member: `chat:${id}`
      // })
    }
  })

  return new StreamingTextResponse(stream)
}
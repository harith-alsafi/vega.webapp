import { GptToolCallResponse } from "@/services/chat-completion";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: Array<ChatCompletionTool> = [
  {
    type: "function",
    function: {
      name: "plot-data",
      description:
        "Plots and shows a line chart when user asks you will not show the plot instead you will ONLY mention to the user that the plot has been shown above",
    },
  },
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Gets the current weather",
    },
  },
];

export const GptToolCallResponseSample: string = JSON.stringify({
  numberOfTools: 2,
  tools: [
    {
      name: "function name example: get-data",
      arguments: "json of arguments example: {dataCount: 4}",
      runCondition: "condition given by the user"
    },
    {
      name: "plot-data",
      arguments: "{x: [1, 2, 3, 4], y: [1, 2, 3, 4]",
      runCondition: "get-data.return is not null or empty"
    }
  ],
} as GptToolCallResponse)

const systemPrompts: ChatCompletionMessageParam[]  = [
  {
    role: "system",
    content: "When you are about to execute multiple function calls, please give a list of all functions you are about to call with their arguments and any conditions",
  },
  {
    role: "system",
    content: `When you are about to execute multiple function calls, please use the following schema ${GptToolCallResponseSample} to give all functions you are about to call with their arguments and any conditions given by user`,
  },
]

export async function GetResponse(messages: ChatCompletionMessageParam[]){
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.5,
    // tool_choice: "none",
    tools: tools,
  });
  return res.choices[0].message
}

export async function POST(req: Request) {
  let messages: ChatCompletionMessageParam[] = [
    systemPrompts[1],
    {
      role: "user",
      content: "give me the weather",
    },
  ]

  const data = await GetResponse(messages)
  messages.push(data)

  messages.push({
    role: "user",
    content: "plot me the data",
  })

  const data1 = await GetResponse(messages)
  messages.push(data1)

  // const condition:boolean = false

  // const data1 = await GetResponse(messages)
  // if(data1.content){
  //   console.log("gpttoolcall", JSON.parse(data1.content) as GptToolCallResponse)
  // }
  // else{
  //   console.log(data1)
  // }
  // messages.push(data1)

  // if(condition){
  //   messages.push({
  //     role: "tool",
  //     tool_call_id: data1?.tool_calls?.[0]?.id ?? "",
  //     content: "Please inform the user that the plot is shown above",
  //   })  
  
  //   const data2 = await GetResponse(messages)
  //   messages.push(data2)
  //   messages.push({
  //     role: "tool",
  //     tool_call_id: data2?.tool_calls?.[0]?.id ?? "",
  //     content: "Please inform the user that the weather is 50 degrees and sunny",
  //   })  
  
  //   const data3 = await GetResponse(messages)
  //   messages.push(data3)  
  // }
  // else{
  //   messages.push({
  //     role: "user",
  //     content: "Thank you for running the tools",
  //   })

  //   const data4 = await GetResponse(messages)
  //   messages.push(data4)
  // }


  return Response.json(messages);
}

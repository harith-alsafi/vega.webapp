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


export async function GetResponse(messages: ChatCompletionMessageParam[]){
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.7,
    tool_choice: "auto",
    tools: tools,
  });
  return res.choices[0].message
}

export async function POST(req: Request) {
  let messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "Make sure all function calls are given in a single response",
    },
    {
      role: "user",
      content: "plot the data and get me the weather",
    },
  ]

  const data1 = await GetResponse(messages)
  messages.push(data1)
  messages.push({
    role: "tool",
    tool_call_id: data1?.tool_calls?.[0]?.id ?? "",
    content: "Please inform the user that the plot is shown above",
  })  

  const data2 = await GetResponse(messages)
  messages.push(data2)
  messages.push({
    role: "tool",
    tool_call_id: data2?.tool_calls?.[0]?.id ?? "",
    content: "Please inform the user that the weather is 50 degrees and sunny",
  })  

  const data3 = await GetResponse(messages)
  messages.push(data3)  

  return Response.json(messages);
}

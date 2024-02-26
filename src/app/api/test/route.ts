import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
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
  {
    type: "function",
    function: {
      name: "get-time-city",
      description: "Gets the time for a specific city.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        return: "string",
        required: ["location"],
      },
    },
  },
  // {
  //   type: "function",
  //   function: {
  //     name: "set-calls",
  //     description: "Call this before any tool calls",
  //     parameters:{
  //       type: "object",
  //       properties: {
  //         toolCalls: {
  //           type: "number",
  //           description: "Give the number of tool calls you are about to make",
  //         },
  //       },
  //       return: "void",
  //       required: ["toolCalls"],
  //     }
  //   },
  // },
];

export const GptToolCallResponseSample: string = JSON.stringify({
  numberOfTools: 2,
  tools: [
    {
      name: "function name example: get-data",
      arguments: "json of arguments example: {dataCount: 4}",
      runCondition: "condition given by the user",
    },
    {
      name: "plot-data",
      arguments: "{x: [1, 2, 3, 4], y: [1, 2, 3, 4]",
      runCondition: "get-data.return is not null or empty",
    },
  ],
} as GptToolCallResponse);

const GptResultExample: GptFlowChartResult = {
  nodes: [
    {
      id: "1",
      name: "get-temp",
      arguments: "",
    },
    {
      id: "2",
      name: "get-humidity",
      arguments: "",
    },
    {
      id: "3",
      name: "turn-fan",
      arguments: "{speed: 10}",
    },
    {
      id: "4",
      name: "turn-fan",
      arguments: "{speed: 20}",
    },
    {
      id: "5",
      name: "turn-fan",
      arguments: "{speed: 50}",
    },
  ],
  edges: [
    {
      id: "e1-2",
      source: "1",
      destination: "2",
      label: "result > 50",
    },
    {
      id: "e2-e5",
      source: "2",
      destination: "5",
      label: "result > 36",
    },
    {
      id: "e1-e3",
      source: "1",
      destination: "3",
      label: "result == 50",
    },
    {
      id: "e1-e4",
      source: "1",
      destination: "4",
      label: "otherwise",
    },
  ],
};

const systemPrompts = [
  "When you are about to execute multiple function calls, please give a list of all functions you are about to call with their arguments and any conditions",
  
  `WHEN you are about to execute multiple function calls, use the following schema ${GptToolCallResponseSample} to give all functions you are about to call with their arguments and any conditions given by user`,
  
  `WHEN you are about to execute multiple function calls, use the following JSON schema ${JSON.stringify(GptResultExample)} to give all functions you are about to call with their arguments and any conditions given by user`,

  `When you are about to execute any function pass any conditions given by the user in the arguments as "condition"`,

  `WHEN you are about to execute any tool call, provide the number of upcoming tool calls in the content of your response, I REPEAT MAKE SURE the number of upcoming tool calls are given in your respponse`,
];

const contentChoice = [
  "If the weather is above 50 degrees then plot me the data, otherwise get me the time of new york city",
  
  "Give me the weather and plot the data",
]

export async function GetResponse(messages: ChatCompletionMessageParam[]) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.7,
    tool_choice: "none",
    response_format : {
      type: "json_object"
    },
    tools: tools,
  });
  return res.choices[0].message;
}

export async function POST(req: Request) {
  let messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompts[2],
    },

    {
      role: "user",
      content: contentChoice[0]
    },
  ];

  const data = await GetResponse(messages);
  messages.push(data);

  // messages.push({
  //   role: "user",
  //   content: "Thanks",
  // })
  // const data1 = await GetResponse(messages);
  // messages.push(data1);

  // if(data.tool_calls){
  //   messages.push({
  //     role: "tool",
  //     tool_call_id: data.tool_calls[0].id,
  //     content: "Please inform the user that the plot has been shown above",
  //   })
  // }
  // const data1 = await GetResponse(messages);
  // messages.push(data1);



  // const data1 = await GetResponse(messages);
  // messages.push(data1);

  // messages.push({
  //   role: "user",
  //   content: "plot me the data",
  // });

  // const data1 = await GetResponse(messages);
  // messages.push(data1);

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

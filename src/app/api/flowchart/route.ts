import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
import { Chat, MessageToolCallResponse } from "@/services/chat-completion";
import OpenAI from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const systemPrompt = `Your purpose is to generate flow chart based on user input and given set of functions, WHEN you are about to execute multiple function calls, use the following JSON schema ${JSON.stringify(
  GptResultExample
)} to give all functions you are about to call with their arguments and any conditions given by user, I repeat ONLY use this JSON schema. No matter what the user stated, make sure the edges list is not empty meaning the nodes MUST ALWAYYS be connected using the edges, you can also use "AND" and "OR" as labels to the edges, make sure you only generate for the given message and thats it`;

export async function POST(req: Request) {
  const json = await req.json();
  const chatResponse = json as Chat;
  const finalMessages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
  const messages: Array<ChatCompletionMessageParam> = chatResponse.messages
    .map((message) => {
      if (message.isIgnored === true) {
        return null;
      }
      if (message.role === "system") {
        return {
          role: message.role,
          content: message.content,
        };
      } else if (message.role == "tool") {
        // return {
        //   role: message.role,
        //   content: message.content,
        //   tool_call_id: message.tool_call_id,
        // } as ChatCompletionToolMessageParam;
      } else if (message.role == "assistant" && message.content) {
        return {
          role: message.role,
          content: message.content,
          //   tool_calls: message.tool_calls,
        } as ChatCompletionAssistantMessageParam;
      } else if (message.role == "user") {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionUserMessageParam;
      }
    })
    .filter(
      (message) => message !== undefined && message !== null
    ) as Array<ChatCompletionMessageParam>;

  finalMessages.push(...messages);

  let lastMsg = finalMessages[finalMessages.length - 1];
  if (lastMsg.role === "user" && lastMsg.content) {
    finalMessages[finalMessages.length - 1].content =
      "Can you get me the flow chart of ONLY the following using the JSON schema given " +
      ` "${lastMsg.content}"`;
  }

  let finalMessage: MessageToolCallResponse | undefined = undefined;
  console.log(finalMessages);

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: finalMessages,
      temperature: 0.7,
      tool_choice: "none",
      response_format: {
        type: "json_object",
      },
      tools: chatResponse.tools,
    });

    const message = res.choices[0].message;
    console.log(message);
    if (message.content) {
      const parsedMessage: GptFlowChartResult = JSON.parse(message.content);
      finalMessage = {
        tool_call_id: "",
        role: "tool",
        content: "",
        data: parsedMessage,
        ui: "flow-chart",
        isIgnored: true,
        messageRating: {
          accuracy: 0,
          completion: 0,
          contextUsed: message.content.length,
          efficiency: 0,
          finalRating: 0,
          relevance: 0,
          speed: 0,
          successRate: 0,
          timeTaken: 0,
          toolsCalled: 1,
        },
      };
    }
  } catch (e) {
    console.log(e);
  }

  return Response.json(finalMessage);
}

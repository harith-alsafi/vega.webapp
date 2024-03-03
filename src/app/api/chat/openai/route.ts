import { Chat, MessageAssistant } from "@/services/chat-completion";
import OpenAI from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const json = await req.json();
  const chatResponse = json as Chat;
  const messages: Array<ChatCompletionMessageParam> = chatResponse.messages
    .map((message) => {
      if (message.isIgnored === true) {
        return null;
      }
      if (message.role == "tool") {
        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.tool_call_id,
        } as ChatCompletionToolMessageParam;
      } else if (message.role == "assistant") {
        return {
          role: message.role,
          content: message.content,
          tool_calls: message.tool_calls,
        } as ChatCompletionAssistantMessageParam;
      } else if (message.role == "user") {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionUserMessageParam;
      } else if (message.role === "system") {
        return {
          role: message.role,
          content: message.content,
        };
      }
    })
    .filter(
      (message) => message !== undefined && message !== null
    ) as Array<ChatCompletionMessageParam>;
  console.log(messages);
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages,
    temperature: chatResponse.temperature,
    tool_choice: "auto",
    tools: chatResponse.tools,
  });

  const message = res.choices[0].message;
  const finalMessage: MessageAssistant = {
    role: message.role,
    content: message.content,
    tool_calls: message.tool_calls,
  };

  return Response.json(finalMessage);
}

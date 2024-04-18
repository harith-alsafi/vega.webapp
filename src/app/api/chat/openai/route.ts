import {
  Chat,
  GenerateMessageRating,
  MessageAssistant,
} from "@/services/chat-completion";
import OpenAI from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const json = await req.json();
  const chatResponse = json as Chat;
  console.log(chatResponse);
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

  const messagesToSend = [
    {
      role: "system",
      content: chatResponse.systemPrompt.content,
    } as ChatCompletionSystemMessageParam,
    ...messages,
  ];
  console.log(messagesToSend);
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: messagesToSend,
    temperature: chatResponse.temperature,
    tool_choice: "auto",
    tools: chatResponse.tools,
  });

  const message = res.choices[0].message;
  const finalMessage: MessageAssistant = {
    role: message.role,
    content: message.content,
    tool_calls: message.tool_calls,
    messageRating: GenerateMessageRating(),
  };

  return Response.json(finalMessage);
}

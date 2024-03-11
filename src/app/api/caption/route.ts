import { ChatImageCapttion, MessageAssistant } from "@/services/chat-completion";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const json = await req.json();
  const caption = json as ChatImageCapttion;

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: caption.text },
          {
            type: "image_url",
            image_url: {
              url: caption.url,
            },
          },
        ],
      },
    ],
  });

  const message = response.choices[0].message;
  const finalMessage: MessageAssistant = {
    role: "assistant",
    content: message.content,
  };

  return Response.json(finalMessage);
}

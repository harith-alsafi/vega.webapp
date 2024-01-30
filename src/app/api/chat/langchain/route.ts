import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";

 
export const runtime = 'edge';
 
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  const { stream, handlers } = LangChainStream();
 
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    streaming: true,
  });
 
  llm
    .invoke(
      (messages as Message[]).map(m =>
        m.role == 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      {},
    )
    .catch(console.error);
        
  return new StreamingTextResponse(stream);
}
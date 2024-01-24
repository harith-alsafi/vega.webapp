import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
 
export const runtime = 'edge';
 
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  const { stream, handlers } = LangChainStream();
 
  const llm = new ChatOpenAI({
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
 

 
  return new StreamingTextResponse(stream);
}
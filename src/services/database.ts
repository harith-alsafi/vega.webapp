"use server";

import { Chat } from "@/services/chat-completion";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

(async () => {
    await client.connect();
})();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

const chatNameSpace = "chat:";

export async function UpdateChat(chat: Chat): Promise<void> {
  await client.set(`${chatNameSpace}${chat.id}`, JSON.stringify(chat));
}

export async function GetChatKeys(): Promise<string[]> {
  try {
    const keys = await client.keys(`${chatNameSpace}*`);
    return keys;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetChats(): Promise<Chat[]> {
  try {
    const chatArray: Chat[] = [];
    const keys = await GetChatKeys();
    for (const key of keys) {
      const chat = await client.get(key);
      if (chat !== null && chat !== undefined) {
        const chatObj: Chat = JSON.parse(chat);
        chatArray.push(chatObj);
      }
    }
    return chatArray;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetChat(id: string): Promise<Chat | null> {
  try {
    const chat = await client.get(`${chatNameSpace}${id}`);
    return chat === null || chat === undefined
      ? null
      : (JSON.parse(chat) as Chat);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function RemoveChat(id: string, path: string){
  await client.del(`${chatNameSpace}${id}`);
  revalidatePath('/')
  return revalidatePath(path)
}

export async function ClearChats(): Promise<void> {
  const keys = await GetChatKeys();
  for (const key of keys) {
    await client.del(key);
  }

  revalidatePath('/')
  return redirect('/')
}

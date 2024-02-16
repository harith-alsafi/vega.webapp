"use server";

import { Chat } from "@/services/chat-completion";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "redis";
import { PiConnection } from "./rasberry-pi";

let client: any | null = null;

export async function getClient() {
  if (client === null || client === undefined) {
    client = createClient({
      url: process.env.REDIS_URL,
    });
    client.on("connect", () => console.log("Redis Client Connected"));
    client.on("error", (err: any) =>
      console.log("Redis Client Connection Error", err)
    );
    await client.connect();
  }

  return client;
}

const chatNameSpace = "chat:";
const piNameSpace = "pi:1";

export async function UpdatePiConnection(pi: PiConnection): Promise<void> {
  const redisClient = await getClient();
  await redisClient.set(`${piNameSpace}`, JSON.stringify(pi));
}

export async function GetPiConnection(): Promise<PiConnection | null> {
  const redisClient = await getClient();
  try {
    const pi = await redisClient.get(`${piNameSpace}`);
    return pi === null || pi === undefined
      ? null
      : (JSON.parse(pi) as PiConnection);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function UpdateChat(chat: Chat): Promise<void> {
  const redisClient = await getClient();
  await redisClient.set(`${chatNameSpace}${chat.id}`, JSON.stringify(chat));
}

export async function GetChatKeys(): Promise<string[]> {
  const redisClient = await getClient();

  try {
    const keys = await redisClient.keys(`${chatNameSpace}*`);
    return keys;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetChats(): Promise<Chat[]> {
  const redisClient = await getClient();

  try {
    const chatArray: Chat[] = [];
    const keys = await GetChatKeys();
    for (const key of keys) {
      const chat = await redisClient.get(key);
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
  const redisClient = await getClient();

  try {
    const chat = await redisClient.get(`${chatNameSpace}${id}`);
    return chat === null || chat === undefined
      ? null
      : (JSON.parse(chat) as Chat);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function RemoveChat(id: string, path: string) {
  const redisClient = await getClient();

  await redisClient.del(`${chatNameSpace}${id}`);
  revalidatePath("/");
  return revalidatePath(path);
}

export async function ClearChats(): Promise<void> {
  const redisClient = await getClient();

  const keys = await GetChatKeys();
  for (const key of keys) {
    await redisClient.del(key);
  }

  revalidatePath("/");
  return redirect("/");
}

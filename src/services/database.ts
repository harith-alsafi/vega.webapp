"use server";

import { Chat, EvaluationInfo } from "@/services/chat-completion";
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
const valNameSpace = "val:1";

export async function UpdatePiConnection(pi: PiConnection): Promise<void> {
  const redisClient = await getClient();
  await redisClient.set(`${piNameSpace}`, JSON.stringify(pi));
}

export interface EvaluationDatabase {
  evaluations: EvaluationInfo[];
  lastEvaluationIndex: number;
  lastEvaluationContentIndex: number;
}

export async function UpdateEvaluation(
  evaluation: EvaluationDatabase
): Promise<void> {
  const redisClient = await getClient();
  await redisClient.set(`${valNameSpace}`, JSON.stringify(evaluation));
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

export async function GetEvaluation(): Promise<EvaluationDatabase | null> {
  const redisClient = await getClient();
  try {
    const val = await redisClient.get(`${valNameSpace}`);
    return val === null || val === undefined
      ? null
      : (JSON.parse(val) as EvaluationDatabase);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function UpdateChatWithNameSpace(
  namespace: string,
  chat: Chat
): Promise<void> {
  const redisClient = await getClient();
  await redisClient.set(`${namespace}${chat.id}`, JSON.stringify(chat));
}

export async function UpdateChat(chat: Chat): Promise<void> {
  await UpdateChatWithNameSpace(chatNameSpace, chat);
}

export async function UpdateEvaluations(evaluations: Chat[]): Promise<void> {}

export async function GetChatKeysWithNameSpace(
  namespace: string
): Promise<string[]> {
  const redisClient = await getClient();

  try {
    const keys = await redisClient.keys(`${namespace}*`);
    return keys;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetChatKeys(): Promise<string[]> {
  return GetChatKeysWithNameSpace(chatNameSpace);
}

export async function GetChatsWithNameSpace(
  namespace: string
): Promise<Chat[]> {
  const redisClient = await getClient();

  try {
    const chatArray: Chat[] = [];
    const keys = await GetChatKeysWithNameSpace(namespace);
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

export async function GetChats(): Promise<Chat[]> {
  return GetChatsWithNameSpace(chatNameSpace);
}

export async function GetChatWithNameSpace(
  namespace: string,
  id: string
): Promise<Chat | null> {
  const redisClient = await getClient();

  try {
    const chat = await redisClient.get(`${namespace}${id}`);
    return chat === null || chat === undefined
      ? null
      : (JSON.parse(chat) as Chat);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function GetChat(id: string): Promise<Chat | null> {
  return GetChatWithNameSpace(chatNameSpace, id);
}

export async function RemoveChatWithNameSpace(
  namespace: string,
  id: string,
  path: string
) {
  const redisClient = await getClient();

  await redisClient.del(`${namespace}${id}`);
}

export async function RemoveChat(id: string, path: string) {
  await RemoveChatWithNameSpace(chatNameSpace, id, path);
  // revalidatePath("/");
  // return revalidatePath(path);
}

export async function ClearChatsWithNameSpace(
  namespace: string
): Promise<void> {
  const redisClient = await getClient();

  const keys = await GetChatKeysWithNameSpace(namespace);
  for (const key of keys) {
    await redisClient.del(key);
  }

  revalidatePath("/");
  return redirect("/");
}

export async function ClearChats(): Promise<void> {
  return await ClearChatsWithNameSpace(chatNameSpace);
}

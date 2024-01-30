import { Chat } from "@/lib/types";
import { kv } from '@vercel/kv'

export async function AppendChat(id: string, chat: Chat): Promise<void> {

}

export async function GetChats(): Promise<Chat[]> {
    return []
}

export async function GetChat(id: string): Promise<Chat | null> {
    return null
}

export async function RemoveChat(id: string): Promise<void> {
    return
}

export async function ClearChats(): Promise<void> {
    return
}

export function GetId(): string {
    return ''
}
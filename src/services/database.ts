import { Chat } from "@/lib/types";


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
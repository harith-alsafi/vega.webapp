'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'

export async function getChats() {
  try {
    const keys = await kv.keys(`*`)
    let chatArray: Chat[] = []
    for (const key of keys) {
      const chat = await kv.hgetall<Chat>(key)
      if(chat !== null && chat !== undefined){
        chatArray.push(chat)
      }
    }
    // console.log(chatArray) 

    return chatArray
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  await kv.del(`chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const keys = await kv.keys(`*`)
  for (const key of keys) {
    await kv.del(key)
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  // const session = await auth()

  // if (!session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== 'me') {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}
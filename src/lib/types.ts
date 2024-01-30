import { type Message } from 'ai'


export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date | number
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface PiComponentInfo {
  name: string
  description: string
  type: string
  pin: string
}

export interface PiFunctionCall {
  name: string
}
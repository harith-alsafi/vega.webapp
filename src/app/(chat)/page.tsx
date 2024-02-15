import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat/messages/chat'

export default function IndexPage() {
  const id = nanoid()
  console.log('id', id)
  return <Chat id={id} />
}
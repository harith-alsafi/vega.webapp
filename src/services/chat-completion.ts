import { ChatCompletionMessage, ChatCompletionMessageParam, ChatCompletionRole } from "openai/resources";

export interface MessageInfo {
    content: string;
    role: ChatCompletionRole;
    ui?: string | JSX.Element | JSX.Element[];
    data?: any;
    function_call?: ChatCompletionMessage.FunctionCall;
}

export interface ChatInfo {
    id: string
    title: string
    createdAt: Date | number
    path: string
    messages: MessageInfo[]
}

export interface ChatCompletion {

}

export function GetResponse(){
    
}
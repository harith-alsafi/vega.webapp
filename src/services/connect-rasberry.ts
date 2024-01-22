import { FunctionCall, FunctionCallPayload, JSONValue } from "ai";
import OpenAI from 'openai'
import { ChatCompletionCreateParams } from 'openai/resources/chat/completions';

export default class RaspberryPi {
    private _piUrl: string;
    private _piPort: number;
    private _piIp: string;
    private static functionCallUrl: string = '/get-function-calls';
    private static runFunctionCallUrl: string = '/run-function-call';

    constructor(port: number, ip: string) {
        this._piUrl = `http://${ip}:${port}`;
        this._piPort = port;
        this._piIp = ip;
    }
    
    async ConnectRaspberryPi() {
        return;
    }
    
    async DisconnectRaspberryPi(){
        return;
    }

    async GetFunctionCalls(): Promise<ChatCompletionCreateParams.Function[] | null>{
        return null;
    }

    async RunFunctionCall(functionCall:FunctionCallPayload): Promise<JSONValue | null>{
        return null;
    }

    async GetComponents(): Promise<JSONValue | null>{
        return null;
    }
    
}


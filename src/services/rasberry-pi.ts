import { FunctionCall, FunctionCallPayload, JSONValue } from "ai";
import { ChatCompletionCreateParams } from 'openai/resources/chat/completions';

export interface PiComponentInfo {
    name: string
    description: string
    type: string
    pin: string
  }
  
  export interface PiFunctionCall {
    name: string
  }

export default class RaspberryPi {
    private _isConnected: boolean = false;
    private _piUrl: string;
    private _piPort: number;
    private _piIp: string;
    private static functionCallUrl: string = '/get-function-calls';
    private static runFunctionCallUrl: string = '/run-function-call';
    private static getComponentsUrl: string = '/get-components';

    constructor(port: number, ip: string) {
        this._piUrl = `http://${ip}:${port}`;
        this._piPort = port;
        this._piIp = ip;
    }
    
    public get isConnected() {
        return this._isConnected;
    }

    async ConnectRaspberryPi() {
        return;
    }
    
    async DisconnectRaspberryPi(){
        return;
    }

    async GetFunctionCalls(): Promise<Array<ChatCompletionCreateParams.Function> | null>{
        return null;
    }

    async RunFunctionCall(functionCall:FunctionCallPayload, runAside: boolean): Promise<PiFunctionCall | null>{
        return null;
    }

    async GetComponents(): Promise<PiComponentInfo[] | null>{
        return null;
    }
}
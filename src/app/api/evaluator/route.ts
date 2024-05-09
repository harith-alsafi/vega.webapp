import {
  EvaluationAgentData,
  EvaluationOutput,
  GenerateMessageRating,
  InputRating,
  MessageAssistant,
  MessageRating,
  MessageToolCallResponse,
  MessageUser,
} from "@/services/chat-completion";
import { PiDeviceInfo } from "@/services/rasberry-pi";
import { get } from "http";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rankingSample: InputRating = {
  speed: 40,
  accuracy: 20,
  relevance: 70,
  efficiency: 90,
  completion: 20,
};

const systemPrompt = `You are an expert at evaluating a chat system that has a list of connected devices, and a list of available functionality, you will be given a user message and a list of system responses for that message, you will have to rate the system response based on the following criteria keeping in mind that each field is from 1 to 99: 
{
  "speed": 40, // how fast was the execution of the response
  "accuracy": 20, // how accurate was the response
  "relevance": 70, // how relevant was the response
  "efficiency": 90, // how efficient was the response
  "completion": 20 // how complete was the response
}
make sure you ONLY give the response using this exact criteria from the JSON schema`;

export function getMessageAll(
  user: MessageUser,
  generatedMessage: Array<MessageAssistant | MessageToolCallResponse>,
  tools: ChatCompletionTool[],
  devices: PiDeviceInfo[]
) {
  let msgData = `Given a system with Available Tools: \n ${JSON.stringify(
    tools
  )} \n Connected Devices: ${JSON.stringify(
    devices
  )} \n Please Generate a rating using the following data \n User Message: ${
    user.content
  } \n Chat Generated Messages: \n`;
  for (let i = 0; i < generatedMessage.length; i++) {
    const message = generatedMessage[i];
    if (message.role === "assistant") {
      msgData += `Assistant Message with content "${message.content}" `;
      msgData +=
        message.data !== undefined
          ? ` with data ${JSON.stringify(message.data)} `
          : "";
      msgData +=
        message.tool_calls !== undefined
          ? ` with tools called ${JSON.stringify(
              message.tool_calls?.map((call) => call.function.name)
            )} `
          : "";
    } else {
      msgData += `Tool Call Response for tool name ${message.name} with content $"{message.content}"`;
      msgData +=
        message.data !== undefined
          ? ` with data ${JSON.stringify(message.data)} `
          : "";
    }
    msgData += ` with time taken ${message.messageRating.timeTaken} and total context generated ${message.messageRating.contextUsed}  \n`;
  }

  return msgData;
}

export function getMessage(
  user: MessageUser,
  generatedMessage: MessageAssistant | MessageToolCallResponse,
  tools: ChatCompletionTool[],
  devices: PiDeviceInfo[]
) {
  let extraData = "";
  if (generatedMessage.role === "assistant") {
    extraData = "this message is an assitant generated message";
    extraData +=
      generatedMessage.data !== undefined
        ? ` with data ${JSON.stringify(generatedMessage.data)} `
        : "";
    extraData +=
      generatedMessage.tool_calls !== undefined
        ? ` with tools called ${JSON.stringify(
            generatedMessage.tool_calls?.map((call) => call.function)
          )} `
        : "";
  } else {
    extraData = "this message is a tool call response";
    extraData +=
      generatedMessage.data !== undefined
        ? ` with data ${JSON.stringify(generatedMessage.data)} `
        : "";
    extraData +=
      generatedMessage.error !== undefined
        ? ` with error ${generatedMessage.error} `
        : "";
  }

  return `Please generate a rating, here is the user message ${
    user.content
  } and the generated message ${
    generatedMessage.content
  }, ${extraData} with the available tools ${JSON.stringify(
    tools
  )} and available devices ${JSON.stringify(devices)}`;
}

export async function getResponse(
  message: string,
  generatedMessageRating: MessageRating
): Promise<MessageRating | undefined> {
  generatedMessageRating =
    generatedMessageRating ??
    ({
      accuracy: 0,
      completion: 0,
      efficiency: 0,
      relevance: 0,
      speed: 0,
      finalRating: 0,
      successRate: 0,
      contextUsed: 0,
      timeTaken: 0,
      toolsCalled: 0,
    } as MessageRating);
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.8,
  });
  const response = res.choices[0].message;
  if (response.content) {
    const rating = JSON.parse(response.content) as InputRating;
    if (
      "accuracy" in rating &&
      "completion" in rating &&
      "efficiency" in rating &&
      "relevance" in rating &&
      "speed" in rating
    ) {
      generatedMessageRating.accuracy = rating.accuracy;
      generatedMessageRating.completion = rating.completion;
      generatedMessageRating.efficiency = rating.efficiency;
      generatedMessageRating.relevance = rating.relevance;
      generatedMessageRating.speed = rating.speed;
      generatedMessageRating.finalRating =
        (generatedMessageRating.accuracy +
          generatedMessageRating.completion +
          generatedMessageRating.efficiency +
          generatedMessageRating.relevance +
          generatedMessageRating.speed) /
        5;
      generatedMessageRating.successRate =
        (generatedMessageRating.speed +
          generatedMessageRating.accuracy +
          generatedMessageRating.relevance) /
        3;

      return generatedMessageRating;
    }
  }
  return undefined;
}

export async function brutForceResponse(
  message: string,
  generatedMessageRating: MessageRating
): Promise<MessageRating> {
  let rating: MessageRating | undefined = undefined;
  while (!rating) {
    rating = await getResponse(message, generatedMessageRating);
  }
  return rating;
}

export function GetMessageRatingAverage(
  messageRatings: MessageRating[]
): MessageRating {
  const averageRating: MessageRating = messageRatings.reduce((a, b) => {
    return {
      speed: a.speed + b.speed,
      accuracy: a.accuracy + b.accuracy,
      relevance: a.relevance + b.relevance,
      efficiency: a.efficiency + b.efficiency,
      completion: a.completion + b.completion,
      finalRating: a.finalRating + b.finalRating,
      successRate: a.successRate + b.successRate,
      timeTaken: a.timeTaken + b.timeTaken,
      contextUsed: a.contextUsed + b.contextUsed,
      toolsCalled: a.toolsCalled + b.toolsCalled,
    };
  });

  return {
    speed: averageRating.speed / messageRatings.length,
    accuracy: averageRating.accuracy / messageRatings.length,
    relevance: averageRating.relevance / messageRatings.length,
    efficiency: averageRating.efficiency / messageRatings.length,
    completion: averageRating.completion / messageRatings.length,
    finalRating: averageRating.finalRating / messageRatings.length,
    successRate: averageRating.successRate / messageRatings.length,
    timeTaken: averageRating.timeTaken,
    contextUsed: averageRating.contextUsed,
    toolsCalled: averageRating.toolsCalled,
  } as MessageRating;
}

export async function POST(req: Request) {
  const json = await req.json();
  const evaluator = json as EvaluationAgentData;
  if (evaluator.generatedMessaages.length > 0) {
    // const data = evaluator.generatedMessaages.map((message) => {
    //   return brutForceResponse(
    //     getMessage(
    //       evaluator.userMessage,
    //       message,
    //       evaluator.tools,
    //       evaluator.devices
    //     ),
    //     message.messageRating
    //   );
    // });
    // const results = await Promise.all(data);
    const result = await brutForceResponse(
      getMessageAll(
        evaluator.userMessage,
        evaluator.generatedMessaages,
        evaluator.tools,
        evaluator.devices
      ),
      GetMessageRatingAverage(
        evaluator.generatedMessaages.map((message) => message.messageRating)
      )
    );
    const evaluationOutput: EvaluationOutput = {
      messageParameter: evaluator.userMessage.messageParameter,
      messageRating: [result],
    };
    return Response.json(evaluationOutput);
  }
}

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

const systemPrompt = `You are an expert at evaluating a chat system that has a list of connected devices, and a list of available functionality, you will be given a user message and a system response, you will have to rate the system response based on a criteria which you will give in the following JSON schema keeping in mind that each field is from 1 to 99: ${JSON.stringify(
  rankingSample
)} make sure you ONLY give the response using this exact criteria from the JSON schema`;

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
  }, ${extraData} with the tools ${JSON.stringify(
    tools
  )} and devices ${JSON.stringify(devices)}`;
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

export async function POST(req: Request) {
  const json = await req.json();
  const evaluator = json as EvaluationAgentData;
  if (evaluator.generatedMessaages.length > 0) {
    const data = evaluator.generatedMessaages.map((message) => {
      return brutForceResponse(
        getMessage(
          evaluator.userMessage,
          message,
          evaluator.tools,
          evaluator.devices
        ),
        message.messageRating
      );
    });
    const results = await Promise.all(data);
    const evaluationOutput: EvaluationOutput = {
      messageParameter: evaluator.userMessage.messageParameter,
      messageRating: results.filter(
        (result) => result !== undefined
      ) as MessageRating[],
    };
    return Response.json(evaluationOutput);
  }
}

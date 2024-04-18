"use server";
import { GptFlowChartResult } from "@/components/chat/flows/flow-chart";
import {
  MessageAssistant,
  Chat,
  Message,
  MessageToolCallResponse,
} from "@/services/chat-completion";
import { DataPoint, DataSeries } from "@/services/rasberry-pi";
import { markdownTable } from "markdown-table";
import OpenAI from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";
import regression from "regression";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function ProcessLaTeX(content: string) {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$

  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
}

export async function RegressionModel(
  data: DataSeries[],
  order?: number
): Promise<string | null> {
  const actualOrder = order ?? 3;
  let resultData: Array<{
    name: string;
    result: regression.Result;
  }> = [];
  for (let i = 0; i < data.length; i++) {
    const dataSeries: regression.DataPoint[] = data[i].data.map((d) => [
      d.x,
      d.y,
    ]);
    const result = regression.polynomial(dataSeries, {
      precision: 2,
      order: actualOrder,
    });
    resultData.push({
      name: data[i].name,
      result: result,
    });
  }
  const markdown = markdownTable([
    ["Name", "Equation"],
    ...resultData.map((data) => {
      let expression = "";
      for (let i = 0; i < data.result.equation.length; i++) {
        const power = actualOrder - i;
        const coefficient = data.result.equation[i];
        if (coefficient !== 0 && coefficient !== -0) {
          const showPositiveSign = coefficient > 0 && expression.length > 0;
          if (power === 0) {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)}`;
          } else if (power === 1) {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)} \\cdot x`;
          } else {
            expression += ` ${
              showPositiveSign ? "+" : ""
            } ${coefficient.toFixed(2)} \\cdot x^{${power}}`;
          }
        }
      }
      return [data.name, `$f(x) = ${expression}$`];
    }),
  ]);
  return markdown;
}

export async function ImageCaptionAgent(
  text: string,
  imageUrl: string,
  abortController?: () => AbortController | null
): Promise<MessageAssistant | null> {
  const response = await openai.chat.completions.create(
    {
      model: "gpt-4-vision-preview",
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: text },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    },
    {
      signal: abortController?.()?.signal,
    }
  );

  const message = response.choices[0].message;
  const finalMessage: MessageAssistant = {
    role: "assistant",
    content: message.content,
  };
  return finalMessage;
}

export async function ChatAgent(
  chat: Chat,
  abortController?:  AbortController 
): Promise<Message> {
  const messages: Array<ChatCompletionMessageParam> = chat.messages
    .map((message) => {
      if (message.isIgnored === true) {
        return null;
      }
      if (message.role == "tool") {
        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.tool_call_id,
        } as ChatCompletionToolMessageParam;
      } else if (message.role == "assistant") {
        return {
          role: message.role,
          content: message.content,
          tool_calls: message.tool_calls,
        } as ChatCompletionAssistantMessageParam;
      } else if (message.role == "user") {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionUserMessageParam;
      } else if (message.role === "system") {
        return {
          role: message.role,
          content: message.content,
        };
      }
    })
    .filter(
      (message) => message !== undefined && message !== null
    ) as Array<ChatCompletionMessageParam>;

  const res = await openai.chat.completions.create(
    {
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "system",
          content: chat.systemPrompt.content,
        } as ChatCompletionMessageParam,
        ...messages,
      ],
      temperature: chat.temperature,
      tool_choice: "auto",
      tools: chat.tools,
    },
    {
      signal: abortController?.signal,
    }
  );

  const message = res.choices[0].message;
  const finalMessage: MessageAssistant = {
    role: message.role,
    content: message.content,
    tool_calls: message.tool_calls,
  };

  if (finalMessage.content) {
    finalMessage.content = ProcessLaTeX(message.content as string);
  }

  return finalMessage;
}

const GptResultExample: GptFlowChartResult = {
  nodes: [
    {
      id: "1",
      name: "get-temp",
      arguments: "",
    },
    {
      id: "2",
      name: "get-humidity",
      arguments: "",
    },
    {
      id: "3",
      name: "turn-fan",
      arguments: "{speed: 10}",
    },
    {
      id: "4",
      name: "turn-fan",
      arguments: "{speed: 20}",
    },
    {
      id: "5",
      name: "turn-fan",
      arguments: "{speed: 50}",
    },
  ],
  edges: [
    {
      id: "e1-2",
      source: "1",
      destination: "2",
      label: "result > 50",
    },
    {
      id: "e2-e5",
      source: "2",
      destination: "5",
      label: "result > 36",
    },
    {
      id: "e1-e3",
      source: "1",
      destination: "3",
      label: "result == 50",
    },
    {
      id: "e1-e4",
      source: "1",
      destination: "4",
      label: "otherwise",
    },
  ],
};

const systemPrompt = `Your purpose is to generate flow chart based on user input and given set of functions, WHEN you are about to execute multiple function calls, use the following JSON schema ${JSON.stringify(
  GptResultExample
)} to give all functions you are about to call with their arguments and any conditions given by user, I repeat ONLY use this JSON schema. No matter what the user stated, make sure the edges list is not empty meaning the nodes MUST ALWAYYS be connected using the edges, you can also use "AND" and "OR" as labels to the edges, make sure you only generate for the given message and thats it`;

export async function FlowChartAgent(
  chat: Chat,
  abortController?: () => AbortController | null
): Promise<Message | null> {
  const finalMessages: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];
  const messages: Array<ChatCompletionMessageParam> = chat.messages
    .map((message) => {
      if (message.isIgnored === true) {
        return null;
      }
      if (message.role === "system") {
        return {
          role: message.role,
          content: message.content,
        };
      } else if (message.role == "tool") {
        // return {
        //   role: message.role,
        //   content: message.content,
        //   tool_call_id: message.tool_call_id,
        // } as ChatCompletionToolMessageParam;
      } else if (message.role == "assistant" && message.content) {
        return {
          role: message.role,
          content: message.content,
          //   tool_calls: message.tool_calls,
        } as ChatCompletionAssistantMessageParam;
      } else if (message.role == "user") {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionUserMessageParam;
      }
    })
    .filter(
      (message) => message !== undefined && message !== null
    ) as Array<ChatCompletionMessageParam>;

  finalMessages.push(...messages);

  let lastMsg = finalMessages[finalMessages.length - 1];
  if (lastMsg.role === "user" && lastMsg.content) {
    finalMessages[finalMessages.length - 1].content =
      "Can you get me the flow chart of ONLY the following using the JSON schema given " +
      ` "${lastMsg.content}"`;
  }

  try {
    const res = await openai.chat.completions.create(
      {
        model: "gpt-3.5-turbo",
        messages: finalMessages,
        temperature: chat.temperature ?? 0.7,
        tool_choice: "none",
        response_format: {
          type: "json_object",
        },
        tools: chat.tools,
      },
      {
        signal: abortController?.()?.signal,
      }
    );

    const message = res.choices[0].message;
    if (message.content) {
      const parsedMessage: GptFlowChartResult = JSON.parse(message.content);
      const finalMessage: MessageToolCallResponse = {
        tool_call_id: "",
        role: "tool",
        content: "",
        data: parsedMessage,
        ui: "flow-chart",
        isIgnored: true,
      };
      if (
        parsedMessage.nodes &&
        parsedMessage.nodes.length &&
        parsedMessage.nodes.length > 1 &&
        parsedMessage.edges
      ) {
        return finalMessage;
      }
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
  }

  return null;
}

import {
  EvaluationInput,
  TestGeneratorAgentData,
} from "@/services/chat-completion";
import { PiToolInfo } from "@/services/rasberry-pi";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const toolsSample = [
  {
    name: "set_led",
    description: "Sets the LED name on or off. ",
    parameters: {
      type: "object",
      properties: {
        name: {
          description: "name of the LED ex: LED1",
          type: "string",
        },
        value: {
          description: "True for on, False for off.",
          type: "string",
        },
      },
      return: "int",
      required: ["name", "value"],
    },
  },
  {
    name: "set_fan",
    description: "Sets the fan on or off. ",
    parameters: {
      type: "object",
      properties: {
        value: {
          description: "True for on, False for off.",
          type: "string",
        },
      },
      return: "_empty",
      required: ["value"],
    },
  },
  {
    name: "get_connected_devices",
    description:
      "Gets the list of connected devices using deviceNames and their information, this is also used to fetch data from certain devices",
    parameters: {
      type: "object",
      properties: {
        deviceNames: {
          description:
            "List of devices to get the information of or fetch data from, given in comma seperated format, for example it can be 'TMP, LED2' (this is optional so when not given it will fetch all the devices)",
          type: "string",
        },
      },
      return: "List",
      required: ["deviceNames"],
    },
  },
];

const sampleDevices = [
  {
    name: "LED1",
    description: "Yellow LED light",

    isInput: false,

    hasRecordedData: false,
  },
  {
    name: "LED2",
    description: "Red LED light",

    isInput: false,

    hasRecordedData: false,
  },
  {
    name: "LED3",
    description: "Blue LED light",
    isInput: false,
    hasRecordedData: false,
  },
  {
    name: "TMP",
    description: "Temperature sensor part of DHT11",

    isInput: true,

    hasRecordedData: true,
  },
  {
    name: "HDT",
    description: "Humidity sensor part of DHT11",

    isInput: true,

    hasRecordedData: true,
  },
  {
    name: "FAN",
    description: "On off Fan connected to a 5v relay",
    isInput: false,
    hasRecordedData: false,
  },
];

const EvaluationInputSample: EvaluationInput[] = [
  {
    content:
      "this is the content of the message for example: turn on the RED led",
    taskComplexity: 1,
    porbable_tools: ["set_led"],
  },
  {
    content:
      "this is the content of the message for example: turn on the RED, GREEN and BLUE led",
    taskComplexity: 3,
    porbable_tools: ["set_led"],
  },
  {
    content:
      "this is the content of the message for example: turn on the RED, GREEN and BLUE led followed by printing 'hi there' on the LCD display",
    taskComplexity: 5,
    porbable_tools: ["set_led", "set_fan", "print_lcd"],
  },
  {
    content:
      "this is the content of the message for example: get the temperature, if it is more than 20 degrees then turn on the fan, else turn on the RED led",
    taskComplexity: 7,
    porbable_tools: ["get_temperature", "set_led", "set_fan"],
  },
  {
    content:
      "this is the content of the message for example: get the temperature, if it is more than 20 degrees then turn on the fan, else get the humidity, if it is more than 50% then turn on the RED led and print 'hi' on the LCD, else set the servo angle to 120",
    taskComplexity: 9,
    porbable_tools: [
      "get_temperature",
      "get_humidity",
      "set_led",
      "set_fan",
      "set_servo",
    ],
  },
];

const systemPrompt = `Your purpose is generating evaluation message for a system that has a list of connected devices, and a list of available functionality, given a complexity, the higher the complexity means that you will use more functionality and more conditional logic you are supposed to generate the evaluation message with the following EXAMPLE JSON schema ${JSON.stringify(
  EvaluationInputSample
)} make sure that the content of the message is NEW and not the same as the example JOSN schema however make sure you give the response using the format of the given JSON schema`;

const systemPrompt2 = `You are an expert at generating a message which will be used to assess a system, you will be  given a set of functionality that the system has, and a set of devices that are connected to the system, in addition you will be given a complexity rating from  1 to 10 which you will use to deide how complex the generated message will be, here is an example generated messages with there complexities: ${JSON.stringify(
  EvaluationInputSample
)} I want you to give me the message in the following JSON format ${JSON.stringify(
  {
    content: "The content of the message",
  }
)} Make sure you ONLY use the available functionality provided and make sure you don't mention any form of delay`;

export async function getResponse(
  taskComplexity: number,
  msg: string
): Promise<EvaluationInput | undefined> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: systemPrompt2 + " " + msg,
        },
      ],
      temperature: 0.7,
    });

    const response = res.choices[0].message;
    if (response.content) {
      const responseJson = JSON.parse(response.content);
      if (responseJson && responseJson.hasOwnProperty("content")) {
        return {
          content: responseJson.content,
          taskComplexity: taskComplexity,
          porbable_tools: [],
        };
      }
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
}

export async function POST(req: Request) {
  const json = await req.json();
  const tester = json as TestGeneratorAgentData;
  let message = ` `;
  // if (tester.complexity) {
  //   message += ` with a complexity of ${tester.complexity} `;
  // } else {
  //   message += ` with a complexity ranging from 1 to 10 `;
  // }
  message += `on that note i want you to generate a message with a complexity of ${
    tester.complexity
  } given the set of available tools as follows: ${JSON.stringify(
    tester.tools
  )} and the list of connected devices: ${JSON.stringify(tester.devices)} `;
  let resultData: EvaluationInput | undefined = undefined;
  let responseString = "";
  try {
    resultData = await getResponse(tester.complexity, message);
    while (!resultData) {
      resultData = await getResponse(tester.complexity, message);
    }
  } catch (e) {
    console.log(responseString);
  }

  return Response.json(resultData);
}

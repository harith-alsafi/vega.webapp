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
    content: "turn on the RED led",
    taskComplexity: 1,
    porbable_tools: ["set_led"],
  },
  {
    content: "turn on the RED, GREEN and BLUE led",
    taskComplexity: 3,
    porbable_tools: ["set_led"],
  },
  {
    content:
      "turn on the RED, GREEN and BLUE led followed by turning on the fan",
    taskComplexity: 5,
    porbable_tools: ["set_led", "set_fan"],
  },
  {
    content:
      "get the temperature, if it is more than 20 degrees then turn on the fan, else turn on the RED led",
    taskComplexity: 7,
    porbable_tools: ["get_temperature", "set_led", "set_fan"],
  },
  {
    content:
      "get the temperature, if it is more than 20 degrees then turn on the fan, else get the humidity, if it is more than 50% then turn on the RED led, else turn on the BLUE led",
    taskComplexity: 9,
    porbable_tools: ["get_temperature", "get_humidity", "set_led", "set_fan"],
  },
];

const systemPrompt = `Your purpose is generating evaluation messages for a chat system that has a list of connected devices, and a list of available functionality, you are supposed to generate a given number of evaluation messages with the following JSON schema ${JSON.stringify(EvaluationInputSample)}, keep in mind you have to make sure that each functionality is used at least once, for example if user asks for 20 messages you then proceed to generate 20 evaluation messages, I REPEAT make sure you ONLY give the response using the JSON schema`;


export async function POST(req: Request) {
  const json = await req.json();
  const tester = json as TestGeneratorAgentData;
  let message = `Generate a total of ${tester.dataSize} evaluation messages,`;
  if (tester.complexity) {
    message += ` with all messages having a complexity of ${tester.complexity} `;
  } else {
    message += ` with a complexity ranging from 1 to 10 `;
  }
  message += `given the list of available functions: ${JSON.stringify(
    tester.tools
  )} and the list of connected devices: ${JSON.stringify(tester.devices)} `;
  let resultData: EvaluationInput[] | undefined = undefined;
  console.log(systemPrompt)
  try {
    console.log(message);
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
    console.log(response);
    if (response.content) {
      resultData = JSON.parse(response.content) as EvaluationInput[];
    }
  } catch (e) {}

  return Response.json(resultData);
}

import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/chat/messages/external-link";
import { IconArrowRight } from "@/components/ui/icons";
import { ChatCompletion } from "@/services/chat-completion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ring } from "ldrs";
ring.register();

const exampleMessages = [
  {
    heading: "Ask the IoT Device on its available commands",
    message: `What is the IoT Device's current available commands"?`,
  },
  {
    heading: "Ask about the current connection with the IoT Device",
    message: "Summarize me the current connection with the IoT Device: \n",
  },
  {
    heading: "Show me the diagram of IoT Device peripherals",
    message: `Please tell me what are the current peripherals \n`,
  },
];

export interface EmptyScreenProps
  extends Pick<
    ChatCompletion,
    | "setInput"
    | "setIsEvaluation"
    | "isEvaluation"
    | "generateTests"
    | "runAllEvaluations"
    | "evaluationStatus"
    | "evaluations"
  > {}

export function EmptyScreen({
  setInput,
  setIsEvaluation,
  isEvaluation,
  generateTests,
  runAllEvaluations,
  evaluationStatus,
  evaluations,
}: EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <div className="flex flex-row">
          <h1 className="mb-2 text-lg font-semibold">
            Welcome to Vega AI Chatbot!
          </h1>
          <div className="grow "> </div>
          <div className="flex flex-col items-center text-center ">
            <Label className="mb-1 text-sm" htmlFor="toggle-evaluation">
              Eval
            </Label>
            <Switch
              checked={isEvaluation}
              onCheckedChange={setIsEvaluation}
              id="toggle-evaluation"
            />
          </div>
        </div>

        <p className="mb-2 leading-normal text-muted-foreground whitespace-normal break-words">
          {!isEvaluation
            ? `This is an AI chatbot used to talk with IoT devices , you can start a
          conversation here or try the following examples`
            : `You are currently in evaluation mode`}
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {isEvaluation ? (
            <div className="flex justify-between w-full">
              <Button
                onClick={generateTests}
                disabled={evaluationStatus !== "None"}
              >
                Generate Tests
                {evaluationStatus === "GeneratingTest" && (
                  <div className="ml-2 mt-1">
                    <l-ring
                      size="20"
                      stroke="2"
                      bg-opacity="0"
                      speed="2"
                      color="black"
                    ></l-ring>
                  </div>
                )}
              </Button>
              {evaluations.length > 0 && (
                <p>{`${evaluations.length} Evaluations Ready`}</p>
              )}
              <Button
                onClick={runAllEvaluations}
                disabled={evaluationStatus !== "None"}
              >
                Run All Evaluations
                {evaluationStatus !== "None" &&
                  evaluationStatus !== "GeneratingTest" && (
                    <div className="ml-2 mt-1">
                      <l-ring
                        size="20"
                        stroke="2"
                        bg-opacity="0"
                        speed="2"
                        color="black"
                      ></l-ring>
                    </div>
                  )}
              </Button>
            </div>
          ) : (
            exampleMessages.map((message, index) => (
              <Button
                key={index}
                variant="link"
                className="h-auto p-0 text-base whitespace-normal break-word"
                onClick={() => setInput(message.message)}
              >
                <IconArrowRight className="mr-2 text-muted-foreground" />
                {message.heading}
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

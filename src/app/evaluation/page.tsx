"use client";
import PlotMessage, {
  PlotInterface,
} from "@/components/chat/plots/plot-message";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { subscribeToUpdateEvalEvent } from "@/lib/event-emmiter";
import {
  Chat,
  EvaluationContent,
  EvaluationInfo,
  EvaluationInput,
  EvaluationOutput,
  EvaluationResult,
  GenerateMessageRating,
  GetRndInteger,
  MessageParameter,
  MessageRating,
  RatingResult,
  chatNameSpace,
  evalNameSpace,
} from "@/services/chat-completion";
import { GetChatsWithNameSpace } from "@/services/database";
import { DataSeries } from "@/services/rasberry-pi";
import { ReactHTML, useEffect, useState } from "react";

export interface CarouselContainerProps {
  children: React.ReactNode;
  title: string;
}

export function CarouselContainer({ children, title }: CarouselContainerProps) {
  return (
    <CarouselItem>
      <Card className="p-1 w-full h-full">
        <CardHeader className="p-1 mb-1 underline">{title}</CardHeader>
        <div className="p-1 h-[800px] w-[900px]">{children}</div>
      </Card>
    </CarouselItem>
  );
}

export function getEvaluationOutput(): EvaluationOutput {
  return {
    messageParameter: {
      totalTime: GetRndInteger(0, 100),
      calledTools: GetRndInteger(0, 10),
      characterSize: GetRndInteger(0, 10),
      taskComplexity: GetRndInteger(0, 10),
      generatedContext: GetRndInteger(0, 10),
    } as MessageParameter,
    messageRating: [
      GenerateMessageRating(),
      GenerateMessageRating(),
      GenerateMessageRating(),
    ] as MessageRating[],
  } as EvaluationOutput;
}

export function reduceResults(results: RatingResult[]): RatingResult {
  const result: RatingResult = {
    successRate: 0,
    taskComplexity: 0,
    finalRating: 0,
    speed: 0,
    accuracy: 0,
    relevance: 0,
    efficiency: 0,
    completion: 0,
  };
  for (const rating of results) {
    result.successRate += rating.successRate;
    result.taskComplexity += rating.taskComplexity;
    result.finalRating += rating.finalRating;
    result.speed += rating.speed;
    result.accuracy += rating.accuracy;
    result.relevance += rating.relevance;
    result.efficiency += rating.efficiency;
    result.completion += rating.completion;
  }
  result.successRate /= results.length;
  result.taskComplexity /= results.length;
  result.finalRating /= results.length;
  result.speed /= results.length;
  result.accuracy /= results.length;
  result.relevance /= results.length;
  result.efficiency /= results.length;
  result.completion /= results.length;
  return result;
}

export function getAverages(chat: Chat): EvaluationResult | undefined {
  const evaluation: EvaluationContent = {
    outputs: [
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
      getEvaluationOutput(),
    ] as EvaluationOutput[],
    inputs: [] as EvaluationInput[],
  };
  const evaluationResult: EvaluationResult = {
    temperature: chat.temperature ?? 0.7,
    top_p: chat.top_p ?? 0.9,
    title: chat.title ?? "Chat",
    results: [] as RatingResult[],
    average: {
      successRate: 0,
      taskComplexity: 0,
      finalRating: 0,
      speed: 0,
      accuracy: 0,
      relevance: 0,
      efficiency: 0,
      completion: 0,
    } as RatingResult,
  };

  for (const output of evaluation.outputs) {
    const result: RatingResult = {
      successRate: 0,
      taskComplexity: output.messageParameter.taskComplexity,
      finalRating: 0,
      speed: 0,
      accuracy: 0,
      relevance: 0,
      efficiency: 0,
      completion: 0,
    };

    for (const feedback of output.messageRating) {
      result.successRate += feedback.successRate;
      result.finalRating += feedback.finalRating;
      result.speed += feedback.speed;
      result.accuracy += feedback.accuracy;
      result.relevance += feedback.relevance;
      result.efficiency += feedback.efficiency;
      result.completion += feedback.completion;
    }

    result.successRate /= output.messageRating.length;
    result.finalRating /= output.messageRating.length;
    result.speed /= output.messageRating.length;
    result.accuracy /= output.messageRating.length;
    result.relevance /= output.messageRating.length;
    result.efficiency /= output.messageRating.length;
    result.completion /= output.messageRating.length;

    evaluationResult.average.taskComplexity += result.taskComplexity;
    evaluationResult.average.successRate += result.successRate;
    evaluationResult.average.finalRating += result.finalRating;
    evaluationResult.average.speed += result.speed;
    evaluationResult.average.accuracy += result.accuracy;
    evaluationResult.average.relevance += result.relevance;
    evaluationResult.average.efficiency += result.efficiency;
    evaluationResult.average.completion += result.completion;

    evaluationResult.results.push(result);
  }

  evaluationResult.average.taskComplexity /= evaluation.outputs.length;
  evaluationResult.average.successRate /= evaluation.outputs.length;
  evaluationResult.average.finalRating /= evaluation.outputs.length;
  evaluationResult.average.speed /= evaluation.outputs.length;
  evaluationResult.average.accuracy /= evaluation.outputs.length;
  evaluationResult.average.relevance /= evaluation.outputs.length;
  evaluationResult.average.efficiency /= evaluation.outputs.length;
  evaluationResult.average.completion /= evaluation.outputs.length;

  return evaluationResult;
}

export function ComplexityVsRating({ array }: { array: RatingResult[] }) {
  const dataSeries: DataSeries[] = [
    {
      name: "Final Rating",
      data: [],
    },
    {
      name: "Speed",
      data: [],
    },
    {
      name: "Accuracy",
      data: [],
    },
    {
      name: "Relevance",
      data: [],
    },
    {
      name: "Efficiency",
      data: [],
    },
    {
      name: "Completion",
      data: [],
    },
    {
      name: "Success Rate",
      data: [],
    },
  ];
  for (const rating of array) {
    dataSeries[0].data.push({
      name: dataSeries[0].name,
      x: rating.taskComplexity,
      y: rating.finalRating,
    });
    dataSeries[1].data.push({
      name: dataSeries[1].name,
      x: rating.taskComplexity,
      y: rating.speed,
    });
    dataSeries[2].data.push({
      name: dataSeries[2].name,
      x: rating.taskComplexity,
      y: rating.accuracy,
    });
    dataSeries[3].data.push({
      name: dataSeries[3].name,
      x: rating.taskComplexity,
      y: rating.relevance,
    });
    dataSeries[4].data.push({
      name: dataSeries[4].name,
      x: rating.taskComplexity,
      y: rating.efficiency,
    });
    dataSeries[5].data.push({
      name: dataSeries[5].name,
      x: rating.taskComplexity,
      y: rating.completion,
    });
    dataSeries[6].data.push({
      name: dataSeries[6].name,
      x: rating.taskComplexity,
      y: rating.successRate,
    });
  }
  console.log(dataSeries);
  return (
    <PlotMessage
      title="Complexity vs Rating"
      data={dataSeries}
      xLabel="Task Complexity"
      yLabel="Rating"
      plotClassName="h-[750px] w-[880px]"
    />
  );
}



/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
function groupBy<K, V>(
  list: Array<V>,
  keyGetter: (input: V) => K
): Map<K, Array<V>> {
  const map = new Map<K, Array<V>>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    const handleUpdateEvaluation = async () => {
      // Reload or fetch new data when the event occurs
      const updatedChats = await GetChatsWithNameSpace(chatNameSpace);
      setChats(updatedChats);

      // if (updatedChats.length > 0) {
      //   const evalChats = updatedChats.filter(
      //     (c) => c.evaluation !== undefined
      //   );
      //   if (evalChats.length > 0) {
      //     setChats(evalChats);
      //   }
      // }

      // Update state or do anything else with the updated data
    };
    subscribeToUpdateEvalEvent(handleUpdateEvaluation);
    handleUpdateEvaluation();

    // Unsubscribe when the component unmounts
    return () => {
      // EventEmitter.off(updateSidebarEvent, handleUpdateSidebar);
    };
  }, []);

  const evaluations = chats
    .map((chat) => getAverages(chat))
    .filter((e) => e !== undefined) as EvaluationResult[];

  const arrayEvaluation = evaluations
    .map((e) => e.results)
    .flat()
    .sort((a, b) => a.taskComplexity - b.taskComplexity);

  const groupedEvaluation = groupBy(
    arrayEvaluation,
    (rating) => rating.taskComplexity
  );
  const averageRating: RatingResult[] = [];
  groupedEvaluation.forEach((ratings, taskComplexity) => {
    averageRating.push(reduceResults(ratings));
  });
  console.log(averageRating);

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        <div className="flex justify-center items-center h-full  w-full ">
          <Carousel orientation="vertical">
            <CarouselContent className="w-fit h-fit">
              <CarouselItem>hiii </CarouselItem>
              <CarouselItem>hiii </CarouselItem>
              <CarouselContainer title="This is a test">
                <ComplexityVsRating array={averageRating} />
              </CarouselContainer>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
}

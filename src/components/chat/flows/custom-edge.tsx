import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";

export interface GptEdge {
  id: string;
  source: string;
  destination: string;
  label: string;
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const xEqual = sourceX === targetX;
  const yEqual = sourceY === targetY;

  const [edgePath, labelX, labelY] = getBezierPath({
    // we need this little hack in order to display the gradient for a straight line
    sourceX: xEqual ? sourceX + 0.0001 : sourceX,
    sourceY: yEqual ? sourceY + 0.0001 : sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate the middle point of the edge path
  const middlePointX = (sourceX + targetX) / 2;
  const middlePointY = (sourceY + targetY) / 2;

  let length = 0;
  const labelLength = label?.toString().length || 0;
  if (label) {
    length = label.toString().length * 4;
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            padding: 10,
            borderRadius: 5,
            fontSize: 14,
            fontWeight: 700,
          }}
          className="nodrag nopan max-w-[10rem] text-center "
        >
          <p className="grow mb-4 p-1 whitespace-normal break-words font-bold bg-primary text-primary-foreground shadow rounded-md  transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-clip">
            {label}
          </p>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

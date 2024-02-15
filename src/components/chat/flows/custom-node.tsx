import { ChatCompletionMessageToolCall } from "openai/resources";
import React, { memo, ReactNode } from "react";
import { Handle, NodeProps, Position } from "reactflow";

export interface GptNode extends ChatCompletionMessageToolCall.Function {
  id: string;
}

export interface CustomNodeData extends GptNode {
  icon?: ReactNode;
  targetPosition?: Position;
  sourcePosition?: Position;
}

export function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const showArguments = data.arguments.length > 0;

  return (
    <div className="wrapper gradient">
      <div className="inner">
        <div className="body">
          {data.icon && <div className="icon">{data.icon}</div>}
          <div>
            <div className="title">{data.name}</div>
            {showArguments && <div className="subline">{data.arguments}</div>}
          </div>
        </div>
        <Handle type="target" position={data.targetPosition ?? Position.Top} />
        <Handle
          type="source"
          position={data.sourcePosition ?? Position.Bottom}
        />
      </div>
    </div>
  );
}

export default memo(CustomNode);

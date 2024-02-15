import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  Connection,
  Controls,
} from "reactflow";

import CustomNode, { CustomNodeData, GptNode } from "./custom-node";

import dagre from "dagrejs";
import CustomEdge, { GptEdge } from "./custom-edge";

import "reactflow/dist/base.css";
import "./index.css";
import { Button } from "@/components/ui/button";
import FunctionIcon from "@/icons/FunctionIcon";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export interface GptFlowChartResult {
  nodes: GptNode[];
  edges: GptEdge[];
}
const position = { x: 0, y: 0 };

export const GptResultExample: GptFlowChartResult = {
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

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  direction: "TB" | "LR" = "LR"
) => {
  const nodeWidth = 300;
  const nodeHeight = direction === "LR" ? 85 : 125;

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    const nodeWithPosition = dagreGraph.node(node.id);
    node.data.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.data.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

function getNodeData(node: GptNode): Node<CustomNodeData> {
  return {
    id: node.id,
    data: {
      id: node.id,
      name: node.name,
      arguments: node.arguments,
      icon: <FunctionIcon />,
    },
    position,
    type: "turbo",
  };
}

function getEdgeData(edge: GptEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.destination,
    label: edge.label,
    animated: true,
  };
}

const nodeTypes = {
  turbo: CustomNode,
};

const edgeTypes = {
  turbo: CustomEdge,
};

const defaultEdgeOptions = {
  type: "turbo",
  markerEnd: "edge-circle",
};

export default function FlowChart(result: GptFlowChartResult) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    result.nodes.map(getNodeData),
    result.edges.map(getEdgeData)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    [setEdges]
  );
  const onLayout = useCallback(
    (direction: "TB" | "LR") => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const [layoutDirection, setLayoutDirection] = React.useState<"TB" | "LR">(
    "TB"
  );

  return (
    <Card className="mb-4 ">
      <div style={{ height: "42vh" }}>
        <ReactFlow
          proOptions={{ hideAttribution: true }}
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          edgesUpdatable={false}
          edgesFocusable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Controls showInteractive={false} />
          <Panel position="top-right">
            <Label
              className="bg-slate-800 rounded p-1"
              onClick={() => {
                onLayout(layoutDirection === "TB" ? "LR" : "TB");
                setLayoutDirection(layoutDirection === "TB" ? "LR" : "TB");
              }}
            >
              {layoutDirection}
            </Label>
          </Panel>
          <svg>
            <defs>
              <linearGradient id="edge-gradient">
                <stop offset="0%" stopColor="#ae53ba" />
                <stop offset="100%" stopColor="#2a8af6" />
              </linearGradient>

              <marker
                id="edge-circle"
                viewBox="-5 -5 10 10"
                refX="0"
                refY="0"
                markerUnits="strokeWidth"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <circle
                  stroke="#2a8af6"
                  strokeOpacity="0.75"
                  r="2"
                  cx="0"
                  cy="0"
                />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
      </div>
    </Card>
  );
}

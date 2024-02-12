import React, { useCallback } from 'react';
import ReactFlow, { Controls, useNodesState, useEdgesState, addEdge, Node, Edge, Connection } from 'reactflow';
import { FiFile } from 'react-icons/fi';

import 'reactflow/dist/base.css';
import './index.css';
import TurboNode, { TurboNodeData } from './TurboNode';
import TurboEdge from './TurboEdge';
import FunctionIcon from './FunctionIcon';

const initialNodes: Node<TurboNodeData>[] = [
  {
    id: '1',
    position: { x: 0, y: 50 },
    data: { icon: <FunctionIcon />, title: 'readFile', subline: 'api.ts' },
    type: 'turbo',
  },
  {
    id: '2',
    position: { x: -200, y: 200 },
    data: { icon: <FunctionIcon />, title: 'bundle', subline: 'apiContents' },
    type: 'turbo',
  },
  {
    id: '3',
    position: { x: 200, y: 200 },
    data: { icon: <FunctionIcon />, title: 'readFile', subline: 'sdk.ts' },
    type: 'turbo',
  },
//   {
//     id: '4',
//     position: { x: 150, y: 150 },
//     data: { icon: <FunctionIcon />, title: 'bundle', subline: 'sdkContents' },
//     type: 'turbo',
//   },
//   {
//     id: '5',
//     position: { x: 25, y: 400 },
//     data: { icon: <FunctionIcon />, title: 'concat', subline: 'api, sdk' },
//     type: 'turbo',
//   },
//   {
//     id: '6',
//     position: { x: 25, y: 650 },
//     data: { icon: <FiFile />, title: 'fullBundle' },
//     type: 'turbo',
//   },
];

const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        label: 'label',
      },
//   {
//     id: 'e2-5',
//     source: '2',
//     target: '5',
//   },
//   {
//     id: 'e4-5',
//     source: '4',
//     target: '5',
//   },
//   {
//     id: 'e5-6',
//     source: '5',
//     target: '6',
//   },
];

const nodeTypes = {
  turbo: TurboNode,
};

const edgeTypes = {
  turbo: TurboEdge,
};

const defaultEdgeOptions = {
  type: 'turbo',
  markerEnd: 'edge-circle',
};

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
    //   onNodesChange={onNodesChange}
    //   onEdgesChange={onEdgesChange}
    //   onConnect={onConnect}
    edgesUpdatable={false}
    edgesFocusable={false}
    nodesDraggable={false}
    nodesConnectable={false}
    nodesFocusable={false}
    
      fitView
      nodeTypes={ nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Controls showInteractive={true} />
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
            <circle stroke="#2a8af6" strokeOpacity="0.75" r="2" cx="0" cy="0" />
          </marker>
        </defs>
      </svg>
    </ReactFlow>
  );
};

export default Flow;

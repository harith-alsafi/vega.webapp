import FunctionIcon from "./FunctionIcon";
import { TurboNodeData } from "./TurboNode";
import ReactFlow, { Controls, useNodesState, useEdgesState, addEdge, Node, Edge, Connection, Position } from 'reactflow';

const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';

export interface NodeProps extends Node<TurboNodeData>{
  targetPosition?: Position;
  sourcePosition?: Position;
}

export const initialNodes: NodeProps[]  = [
  {
    id: '1',
    type: 'turbo',

    data: { icon: <FunctionIcon />, title: 'input', subline: 'api.ts' },
    position,
    
  },
  {
    type: 'turbo',

    id: '2',
    data: { icon: <FunctionIcon />, title: 'node 2', subline: 'apiContents' },
    position,
  },
  {
    type: 'turbo',

    id: '2a',
    data: { icon: <FunctionIcon />, title: 'node 2a', subline: 'apiContents' },
    position,
  },
  {
    type: 'turbo',

    id: '2b',
    data: { icon: <FunctionIcon />, title: 'node 2b', subline: 'apiContents' },
    position,
  },
  {
    type: 'turbo',

    id: '2c',
    data: { icon: <FunctionIcon />, title: 'node 2c', subline: 'apiContents' },
    position,
  },
  {
    type: 'turbo',

    id: '2d',
    data: { icon: <FunctionIcon />, title: 'node 2d', subline: 'apiContents' },
    position,
  },
  {
    type: 'turbo',

    id: '3',
    data: { icon: <FunctionIcon />, title: 'node 3', subline: 'apiContents' },
    position,
  },
];

export const initialEdges:Edge[] = [
  { id: 'e12', source: '1', target: '2', label: "hi", animated: true },
  { id: 'e13', source: '1', target: '3', animated: true },
  { id: 'e22a', source: '2', target: '2a', label: "bye", animated: true },
  { id: 'e22b', source: '2', target: '2b', animated: true },
  { id: 'e22c', source: '2', target: '2c', animated: true },
  { id: 'e2c2d', source: '2c', target: '2d', label: "hola", animated: true },
];

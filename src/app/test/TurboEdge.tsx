import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

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
  label
}: EdgeProps) {
  const xEqual = sourceX === targetX;
  const yEqual = sourceY === targetY;

  const [edgePath] = getBezierPath({
    // we need this little hack in order to display the gradient for a straight line
    sourceX: xEqual ? sourceX + 0.0001 : sourceX,
    sourceY: yEqual ? sourceY + 0.0001 : sourceY,
    // sourceX,
    // sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate the middle point of the edge path
  const middlePointX = (sourceX + targetX) / 2;
  const middlePointY = (sourceY + targetY) / 2;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <text x={middlePointX} y={middlePointY} textAnchor="middle" >
          {label}
        </text>
      )}
    </>
  );
}

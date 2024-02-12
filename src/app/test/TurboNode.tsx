import React, { memo, ReactNode } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { FiCloud } from 'react-icons/fi';

export type TurboNodeData = {
  title: string;
  icon?: ReactNode;
  subline?: string;
};

export function TurboNode({ data }: NodeProps<TurboNodeData>){
  return (
    <>
      {/* <div className="cloud gradient">
        <div>
          <FiCloud />
        </div>
      </div> */}
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.icon && <div className="icon">{data.icon}</div>}
            <div>
              <div className="title">{data.title}</div>
              {data.subline && <div className="subline">{data.subline}</div>}
            </div>
          </div>
          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Bottom} />
        </div>
      </div>
    </>
  );
};

export default memo(TurboNode);

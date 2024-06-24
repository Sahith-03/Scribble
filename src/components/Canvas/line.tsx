import React from 'react';

interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  // handleShapeClicks: (index: number) => void;
}

interface ShapeProps{
  index: number;
  x1: number;
  y1: number;
  type: string;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  handleShapeClicks: (index: number,e: React.MouseEventHandler<SVGCircleElement | SVGRectElement>) => void;
}

const Line: React.FC<LineProps> = ({ x1, y1, x2, y2, color, width }) => {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};


const Shape: React.FC<ShapeProps> = ({index,x1, y1,type , width, height, radius, color, strokeWidth,handleShapeClicks}) => {
  if (type === 'rectangle' || type === 'square') {
    return <rect key={index} onClick={(index)=>handleShapeClicks} x={x1} y={y1} width={width} height={height} stroke={color} strokeWidth={strokeWidth} fill="none" />;
  }
  if (type === 'circle') {
    return <circle key={index} onClick={(index)=>handleShapeClicks} cx={x1} cy={y1} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" />;
  }
};

export {Shape,Line};

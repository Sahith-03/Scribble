"use client"

import React from 'react';
import {source_code_pro,indie_flower,nunito} from '../fonts';
import type { NextFont } from 'next/dist/compiled/@next/font';

interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  // handleShapeClicks: (index: number) => void;
}

interface ShapeProps{
  x1: number;
  y1: number;
  type: string;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  index?: number;
  fill: string;
}

interface PolyLineProps{
  points: string;
  color: string;
  width: number;
}

interface textData{
  x1: number;
  y1: number;
  prompt : string;
  font: NextFont;
  color:string;
}

const Line: React.FC<LineProps> = ({ x1, y1, x2, y2, color, width,opacity }) => {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} opacity={opacity} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};


const Shape: React.FC<ShapeProps> = ({ x1, y1, type, width, height, radius, color, strokeWidth, index,fill }) => {
  // const handleClick = (e: React.MouseEvent<SVGCircleElement | SVGRectElement | SVGEllipseElement>) => {
  //   handleShapeClick(index, e);
  // };
  if (type === 'rectangle' || type === 'square') {
    return <rect x={x1} y={y1} width={width} height={height} stroke={color} strokeWidth={strokeWidth} fill={fill} />;
  }
  if (type === 'circle') {
    return <circle cx={x1} cy={y1} r={radius} stroke={color} strokeWidth={strokeWidth} fill={fill} />;
  }
  // Add similar logic for other shapes like triangle
  return null;
};

const PolyLine: React.FC<PolyLineProps> = ({ points, color, width }) => {
  console.log("Inside controller:",points);
  return <polyline points={points} stroke={color} strokeWidth={width} fill="none" />;
}

const Text: React.FC<textData> = ({x1,y1,prompt,font,color}) => {
  var string_array = prompt.split("\n");
  return (
    <text x={x1} y={y1} fontSize={25} className={font.className} fill={color}>
      {string_array.map((line, index) => (
        <tspan key={index} x={x1} dy={`${index === 0 ? 0 : 1.2}em`}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export {Shape,Line,PolyLine,Text};

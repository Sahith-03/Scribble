"use client"

import React from 'react';

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
  handleShapeClick: (index: number, e: React.MouseEvent<SVGCircleElement | SVGRectElement | SVGEllipseElement>) => void;
  index: number;
}

const Line: React.FC<LineProps> = ({ x1, y1, x2, y2, color, width,opacity }) => {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} opacity={opacity} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};


const Shape: React.FC<ShapeProps> = ({ x1, y1, type, width, height, radius, color, strokeWidth, handleShapeClick, index }) => {
  const handleClick = (e: React.MouseEvent<SVGCircleElement | SVGRectElement | SVGEllipseElement>) => {
    handleShapeClick(index, e);
  };
  if (type === 'rectangle' || type === 'square') {
    return <rect onClick={handleClick} x={x1} y={y1} width={width} height={height} stroke={color} strokeWidth={strokeWidth} fill="none" />;
  }
  if (type === 'circle') {
    return <circle onClick={handleClick} cx={x1} cy={y1} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" />;
  }
  // Add similar logic for other shapes like triangle
  return null;
};

export {Shape,Line};

import React, { useEffect } from 'react';
import { Rect, Text, Circle, Line } from 'react-konva';
import { NextFont } from 'next/dist/compiled/@next/font';

interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  drag?: boolean;
  handleDragEnd?: () => void;
}

interface ShapeProps {
  x1: number;
  y1: number;
  type: string;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  fill: string;
  drag: boolean;
  handleDragEnd?: () => void;
}

interface PolyLineProps {
  points: number[];
  color: string;
  width: number;
  drag?: boolean;
  handleDragEnd?: () => void;
}

interface textData {
  x1: number;
  y1: number;
  prompt: string;
  font: NextFont;
  color: string;
  fontSize: number;
  drag: boolean;
  handleDragEnd?: () => void;
}

const DrawLine: React.FC<LineProps> = React.memo(({ x1, y1, x2, y2, color, width, opacity, drag, handleDragEnd }) => {
  useEffect(() => {
    console.log("drag:", drag);
  }, [drag]);

  return <Line points={[x1, y1, x2, y2]} opacity={opacity} stroke={color} strokeWidth={width} strokeLinecap="round" draggable={drag} onDragEnd={handleDragEnd} />;
}, (prevProps, nextProps) => {
  return (
    prevProps.x1 === nextProps.x1 &&
    prevProps.y1 === nextProps.y1 &&
    prevProps.x2 === nextProps.x2 &&
    prevProps.y2 === nextProps.y2 &&
    prevProps.color === nextProps.color &&
    prevProps.width === nextProps.width &&
    prevProps.opacity === nextProps.opacity &&
    prevProps.drag === nextProps.drag
  );
});

const DrawShape: React.FC<ShapeProps> = React.memo(({ x1, y1, type, width, height, radius, color, strokeWidth, fill, drag,handleDragEnd }) => {
  useEffect(() => {
    console.log("drag:", drag);
  }, [drag]);

  if (type === 'rectangle' || type === 'square') {
    return <Rect x={x1} y={y1} width={width} height={height} stroke={color} strokeWidth={strokeWidth} draggable={drag} hitStrokeWidth={1} fill={fill}/>;
  } else if (type === 'circle') {
    return <Circle x={x1} y={y1} radius={radius} stroke={color} strokeWidth={strokeWidth} fill={fill} draggable={drag} onDragEnd={handleDragEnd}/>;
  }
  return null;
}, (prevProps, nextProps) => {
  return (
    prevProps.x1 === nextProps.x1 &&
    prevProps.y1 === nextProps.y1 &&
    prevProps.type === nextProps.type &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.radius === nextProps.radius &&
    prevProps.color === nextProps.color &&
    prevProps.strokeWidth === nextProps.strokeWidth &&
    prevProps.fill === nextProps.fill &&
    prevProps.drag === nextProps.drag
  );
});

const DrawPolyLine: React.FC<PolyLineProps> = React.memo(({ points, color, width, drag , handleDragEnd}) => {
  useEffect(() => {
    console.log("drag:", drag);
  }, [drag]);

  return <Line points={points} stroke={color} strokeWidth={width} fill="none" draggable={drag} onDragEnd={handleDragEnd}/>;
}, (prevProps, nextProps) => {
  return (
    prevProps.points === nextProps.points &&
    prevProps.color === nextProps.color &&
    prevProps.width === nextProps.width &&
    prevProps.drag === nextProps.drag
  );
});

const DrawText: React.FC<textData> = React.memo(({ x1, y1, prompt, color, font, fontSize, drag, handleDragEnd }) => {
  useEffect(() => {
    console.log("drag:", drag);
  }, [drag]);

  return (
    <Text x={x1-50} y={y1-9} text={prompt} fontSize={fontSize} fontFamily={font.style.fontFamily} fill={color} draggable={drag} onDragEnd={handleDragEnd} align={'center'} lineHeight={1.25}/>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.x1 === nextProps.x1 &&
    prevProps.y1 === nextProps.y1 &&
    prevProps.prompt === nextProps.prompt &&
    prevProps.font === nextProps.font &&
    prevProps.color === nextProps.color &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.drag === nextProps.drag
  );
});

export { DrawShape, DrawLine, DrawPolyLine, DrawText };

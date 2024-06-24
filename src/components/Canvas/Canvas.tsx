"use client"

import React, { useState, useRef } from 'react';
import {Shape,Line} from './line';

interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

interface ShapeData{
  x1: number;
  y1: number;
  type: string;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
}

interface toolBarProps{
  stylusColor: string;
  lineWidth: number;
  isPanning : boolean;
  setIsPanning: (isPanning: boolean) => void;
  tool: string;
  background: string;
}

const Canvas: React.FC<toolBarProps> = ({stylusColor,lineWidth,isPanning,setIsPanning,tool,background}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState([0, 0, window.innerWidth, window.innerHeight]);
  // const [stylusColor, setStylusColor] = useState('#000000');
  // const [lineWidth, setLineWidth] = useState(2);
  const [lines, setLines] = useState<LineData[]>([]);
  const [shapes,setShapes] = useState<ShapeData[]>([]);
  const [erasePaths,setErasePaths] = useState<LineData[]>([]);
  const [currentLine, setCurrentLine] = useState<{ x1: number; y1: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'rectangle',color:stylusColor,strokeWidth:lineWidth});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    if(tool === 'pan'){
      alert("panning")
    if (e.button === 1) { // Middle mouse button for panning
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    }
    // if(tool !== 'pen') return;
    const x = e.clientX - rect.left + viewBox[0];
    const y = e.clientY - rect.top + viewBox[1];
    setIsDrawing(true);
    setCurrentLine({ x1: x, y1: y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if(tool === 'pan'){
    if (isPanning && startPan) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setViewBox([viewBox[0] - dx, viewBox[1] - dy, viewBox[2], viewBox[3]]);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    }
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (!isDrawing || !currentLine || !currentShape) return;
    const x = e.clientX - rect.left + viewBox[0];
    const y = e.clientY - rect.top + viewBox[1];
    if(tool === 'pen'){
      setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color: stylusColor, width: lineWidth }]);
      setCurrentLine({ x1: x, y1: y });
    }
    if(tool === 'eraser'){
      setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color:background , width: lineWidth }]);
      setCurrentLine({ x1: x, y1: y });
    }


    if(shapes.length > 0 && tool === 'rectangle' || tool === 'square' || tool === 'circle'){
      const lastShape = shapes.pop();
    }
    if (tool === 'rectangle') {
      const width = x - currentLine.x1, height = y - currentLine.y1;
      setShapes((prevShapes)=> [...prevShapes,{...currentLine, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth}])
      // setCurrentShape({...currentLine, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth});
    } else if (tool === 'square') {
      const side = Math.max(Math.abs(x - currentLine.x1), Math.abs(y - currentLine.y1));
      setShapes((prevShapes)=> [...prevShapes,{...currentLine, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth}]);
      // setCurrentShape({...currentLine, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth});
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - currentLine.x1, 2) + Math.pow(y - currentLine.y1, 2));
      setShapes((prevShapes)=> [...prevShapes,{...currentLine, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth}]);
      // setCurrentShape({...currentLine, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth});
    }
    // setShapes((prevShapes)=> [...prevShapes,currentShape]);
  };

  const handleMouseUpOrOut = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning && tool === 'pan') {
      setIsPanning(false);
      setStartPan(null);
      return;
    }
    if(currentShape && tool === 'rectangle' || tool === 'square' || tool === 'circle'){
    console.log("Shapes:",shapes.length)
    setShapes((prevShapes)=> [...prevShapes,currentShape]);
    }
    setIsDrawing(false);
    setCurrentLine(null);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newWidth = viewBox[2] * zoomFactor;
    const newHeight = viewBox[3] * zoomFactor;
    setViewBox([viewBox[0], viewBox[1], newWidth, newHeight]);
  };

  const panCanvas = () => {
    setIsPanning(!isPanning);
  };

  const handleShapeClicks = (index: number,e: React.MouseEventHandler<SVGCircleElement | SVGRectElement>) => {
    if(tool == "eraser"){
      alert("Erasing")
      setShapes(shapes.filter((_,i)=> i!==index));
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width="100vw"
        height="100vh"
        className="border border-gray-300 background-image: radial-gradient(black 1px, transparent 0);"
        viewBox={viewBox.join(' ')}
        // viewBox='0 0 800 1000'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrOut}
        onMouseLeave={handleMouseUpOrOut}
        // onWheel={handleWheel}
      >
        {lines.map((line, index) => (
          <Line key={index} {...line} />
        ))};
        {shapes.map((shape,index)=>(
          <Shape index={index} {...shape} handleShapeClicks={handleShapeClicks}/>
        ))}
      </svg>
    </div>
  );
};

export default Canvas;

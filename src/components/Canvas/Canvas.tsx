"use client"

import React, { useState, useRef, useEffect } from 'react';
import {Shape,Line,PolyLine} from './line';
import "./Canvas.css";

interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
}

interface PolyLineData{
  points: string;
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
  const [polyLine,setPolyLines] = useState<PolyLineData[]>([]); 
  const [shapes,setShapes] = useState<ShapeData[]>([]);
  const [erasePaths,setErasePaths] = useState<LineData[]>([]);
  const [points,setPoints] = useState<string>('');
  const [currentLine, setCurrentLine] = useState<LineData>({ x1: 0, y1: 0, x2: 0, y2: 0, color: stylusColor, width: lineWidth,opacity:1 });
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'rectangle',color:stylusColor,strokeWidth:lineWidth});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [laserTimeout, setLaserTimeout] = useState<NodeJS.Timeout | null>(null);
  const [laserLines, setLaserLines] = useState<LineData[]>([]);

  useEffect(() => {
    if(tool === 'pan'){
      svgRef.current?.classList.add('cursor-grab');
    }
    else{
      svgRef.current?.classList.remove('cursor-grab');
    }
  }, [viewBox]);

  const getTransformedCoordinates = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      x: (x / rect.width) * viewBox[2] + viewBox[0],
      y: (y / rect.height) * viewBox[3] + viewBox[1],
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    if(tool === 'pan'){
    if (e.button === 0) { // Middle mouse button for panning
      // alert("panning")
      svgRef.current?.classList.add('cursor-grabbing');
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    }
    // if(tool !== 'pen') return;
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);
    if(tool === 'pen'){
      setPoints(`${x},${y}`);
    }
    setIsDrawing(true);
    setCurrentLine({ x1: x, y1: y, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // if(tool === 'pan'){
    if (isPanning && startPan) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setViewBox([viewBox[0] - dx, viewBox[1] - dy, viewBox[2], viewBox[3]]);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    // }
    if (!isDrawing || !currentLine || !currentShape) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);

    if(tool === 'line'){
      if(lines.length > 0){
        const lastLine = lines.pop();
        // setLines(lines);     
      }
      setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 }]);
      // setCurrentLine({ x1: x, y1: y });
    }
    else if(tool === 'pen'){
      // setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 }]);
      // setCurrentLine({ x1: x, y1: y });
      setPoints(`${points} ${x},${y}`);
      setPolyLines((prevLines) => [...prevLines, { points: points, color: stylusColor, width: lineWidth }]);
    }
    else if(tool === 'eraser'){
      setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color:background , width: lineWidth,opacity:1 }]);
      setCurrentLine({ x1: x, y1: y, x2: x, y2: y, color: background, width: lineWidth,opacity:1});
    }
    else if (tool === 'laser') {
      if (!currentLine) return;
      // if(laserLines.length > 0){
      //   // setLaserLines(laserLines);
      // }
      const newLaserLine: LineData = { x1: currentLine.x1, y1: currentLine.y1, x2: x, y2: y, color: 'red', width: lineWidth, opacity: 1 };
      setLaserLines((prevLines) => [...prevLines, newLaserLine]);
      // setCurrentLine({ x1: x, y1: y });
      // if (laserTimeout) clearTimeout(laserTimeout);
      // setLaserTimeout(setTimeout(() => fadeLaserLine(newLaserLine), 100));
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

  const fadeLaserLine = (line: LineData) => {
    const fadeStep = () => {
      setLaserLines((prevLines) => {
        const updatedLines = prevLines.map((l) => (l === line ? { ...l, opacity: l.opacity - 0.2 } : l));
        return updatedLines.filter((l) => l.opacity > 0);
      });
      if (line.opacity > 0) {
        requestAnimationFrame(fadeStep);
      }
    };
    fadeStep();
  };

  const handleMouseUpOrOut = (e: React.MouseEvent<SVGSVGElement>) => {
    if(tool==='laser'){
        const lastLine = setLaserLines([]);
    }
    if (tool === 'laser') {
      if (laserTimeout) clearTimeout(laserTimeout);
      setLaserTimeout(setTimeout(() => {
        if (currentLine) fadeLaserLine({ x1: currentLine.x1, y1: currentLine.y1, x2: currentLine.x1, y2: currentLine.y1, color: stylusColor, width: lineWidth, opacity: 1 });
      }, 100));
    }
    else if(tool === 'line'){
      console.log("Lines:",lines.length)
      setLines((prevLines)=> [...prevLines,currentLine]);
    }
    else if(tool === 'pen'){
      setPoints('');
    }
    else if (isPanning && tool === 'pan') {
      svgRef.current?.classList.remove('cursor-grabbing');
      setIsPanning(false);
      setStartPan(null);
      return;
    }
    else if(currentShape && tool === 'rectangle' || tool === 'square' || tool === 'circle'){
    console.log("Shapes:",shapes.length)
    setShapes((prevShapes)=> [...prevShapes,currentShape]);
    }
    setIsDrawing(false);
    // setCurrentLine([]);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newWidth = viewBox[2] * zoomFactor;
    const newHeight = viewBox[3] * zoomFactor;

    const mouseX = e.clientX - svgRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - svgRef.current!.getBoundingClientRect().top;

    const newViewBoxX = viewBox[0] + (mouseX / svgRef.current!.clientWidth) * (viewBox[2] - newWidth);
    const newViewBoxY = viewBox[1] + (mouseY / svgRef.current!.clientHeight) * (viewBox[3] - newHeight);

    setViewBox([newViewBoxX, newViewBoxY, newWidth, newHeight]);
  };

  const panCanvas = () => {
    setIsPanning(!isPanning);
  };

  const handleShapeClick = (index: number, e: React.MouseEvent<SVGCircleElement | SVGRectElement | SVGEllipseElement>) => {
    if (tool === 'eraser') {
      setShapes(shapes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width="100vw"
        height="100vh"
        className={`border border-gray-300 ${tool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`}
        viewBox={viewBox.join(' ')}
        // viewBox='0 0 800 1000'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrOut}
        onMouseLeave={handleMouseUpOrOut}
        onWheel={handleWheel}
      >
        {polyLine.map((polyline, index) => (
          <PolyLine key={index} {...polyline} />
        ))};
        {laserLines.map((laserLine, index) => (
          <Line key={index} {...laserLine} />
        ))}
        {shapes.map((shape,index)=>(
          <Shape index={index} {...shape} handleShapeClick={handleShapeClick}/>
        ))}
        {lines.map((line, index) => (
          <Line key={index} {...line} />
        ))}
      </svg>
      <div id="scale">
        <button>+</button>
        <button><span id="scalePercent"></span></button>
        <button>-</button>
      </div>
    </div>
  );
};

export default Canvas;

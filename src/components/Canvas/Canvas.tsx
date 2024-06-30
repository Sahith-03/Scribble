"use client"

import React, { useState, useRef, useEffect, use, useCallback } from 'react';
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
  history: PolygonData[][];
  setHistory: React.Dispatch<React.SetStateAction<PolygonData[][]>>
}

interface PolygonData{
  polygon: ShapeData | LineData | PolyLineData;
  type: string;
}

const Canvas: React.FC<toolBarProps> = ({stylusColor,lineWidth,isPanning,setIsPanning,tool,background,history,setHistory}) => {
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
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [laserTimeout, setLaserTimeout] = useState<NodeJS.Timeout | null>(null);
  const [laserLines, setLaserLines] = useState<LineData[]>([]);
  const [polygons,setPolygon] = useState<PolygonData[]>([]);
  const [startPoint,setStartPoint] = useState<{x1:number,y1:number}>({x1:0,y1:0});
  // const [history,setHistory] = useState<PolygonData[][]>([]);
  const [polygonStack,setPolygonStack] = useState<PolygonData[][]>([]);

  useEffect(() => {
    if(tool === 'pan'){
      svgRef.current?.classList.add('cursor-grab');
    }
    else{
      svgRef.current?.classList.remove('cursor-grab');
    }
  }, [viewBox]);

  useEffect(() => {
    if(history.length > 0){
      if(history[history.length - 1] !== polygons){
      setHistory((prevHistory) =>(prevHistory?[...prevHistory, polygons] : [polygons] ) );
      console.log("Polygons:",polygons)
      }
    }
    else{
      setHistory([polygons]);
    }
  }, [polygons]);

  useEffect(() => {
    console.log('PolygonStack:',polygonStack)
  },[polygonStack])

  useEffect(() => {
    console.log("History:",history)
  },[history])

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
    setStartPoint({x1:x,y1:y});
    // setCurrentLine({ x1: x, y1: y, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 });
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
      setCurrentLine({ x1: startPoint.x1, y1: startPoint.y1, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 });
      setLines((prevLines) => [...prevLines, currentLine]);
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:currentLine,type:'line'}] : [{polygon:currentLine,type:'line'}]));
      // if(lines.length > 0){
      //   const lastLine = lines.pop();
      //   const lastPolygon = polygons.pop();
      //   // setLines(lines);
      // }
      console.log("polygons:",polygons.length)
      // setPolygon((prevPolygon)=>[...prevPolygon,{polygon:currentLine,type:'line'}]);
      // setCurrentLine({ x1: x, y1: y });mem
    }
    else if(tool === 'pen'){
      // setLines((prevLines) => [...prevLines, { ...currentLine, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 }]);
      // setCurrentLine({ x1: x, y1: y });
      setPoints(`${points} ${x},${y}`);
      setPolyLines((prevLines) => [...prevLines, { points: points, color: stylusColor, width: lineWidth }]);
      setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{points:points,color:stylusColor,width:lineWidth},type:'polyline'}] : [{polygon:{points:points,color:stylusColor,width:lineWidth},type:'polyline'}] ));
    }
    else if(tool === 'eraser'){
      setPoints(`${points} ${x},${y}`);
      setPolyLines((prevLines) => [...prevLines, { points: points, color: background, width: lineWidth }]);
      setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{points:points,color:background,width:lineWidth},type:'polyline'}] : [{polygon:{points:points,color:background,width:lineWidth},type:'polyline'}] ));
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

    // if(shapes.length > 0 && tool === 'rectangle' || tool === 'square' || tool === 'circle'){
    //   const lastShape = shapes.pop();
    //   // const lastPolygon = polygons.pop();
    //   setPolygon((prevPolygon)=> prevPolygon.slice(0,-1));
    // }
    if (tool === 'rectangle') {
      const width = x - startPoint.x1, height = y - startPoint.y1;
      setCurrentShape({...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth});
      setShapes((prevShapes)=> [...prevShapes,{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth}])
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth},type:"rectangle"}] : [{polygon:{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth},type:"rectangle"}]));
      
    } else if (tool === 'square') {
      const side = Math.max(Math.abs(x - startPoint.x1), Math.abs(y - startPoint.y1));
      setCurrentShape({...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth});
      setShapes((prevShapes)=> [...prevShapes,{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth}]);
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth},type:"square"}] : [{polygon:{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth},type:"square"}]));
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPoint.x1, 2) + Math.pow(y - startPoint.y1, 2));
      setCurrentShape({...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth});
      setShapes((prevShapes)=> [...prevShapes,currentShape]);
      // setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth},type:"circle"}] : [{polygon:{...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth},type:"circle"}]));
    }
    // useEffect(() => {
    
  // }, [shapes,polygons]);
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

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
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
      setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:currentLine,type:'line'}] : [{polygon:currentLine,type:'line'}]));
      // setHistory((prevHistory) => (prevHistory ? [...prevHistory,polygons] : [polygons]));
    }
    else if(tool === 'pen'){
      // setPolygon((prevPolygon)=>[...prevPolygon,{polygon:{points:points,color:stylusColor,width:lineWidth},type:'polyline'}]);
      setPoints('');
    }
    else if(tool === 'eraser'){
      // setPolygon((prevPolygon)=>[...prevPolygon,{polygon:{points:points,color:background,width:lineWidth},type:'polyline'}]);
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
    setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:currentShape,type:currentShape.type}] : [{polygon:currentShape,type:currentShape.type}]));
    }
    // setHistory((prevHistory) => (prevHistory ? [...prevHistory,polygons] : [polygons]));
    setPolygonStack([]);
    setIsDrawing(false);
    setCurrentShape({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth})
    setCurrentLine({ x1: 0, y1: 0, x2: 0, y2: 0, color: stylusColor, width: lineWidth,opacity:1 });
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

  const undo = useCallback(()=>{
    if (history.length > 1) {
      const lasthistory = history[history.length - 1];
      setHistory((prevHistory)=> {
        const history = [...prevHistory];
        const lastHistory = history.pop();
        if (lastHistory !== undefined) 
        {
          setPolygon(history[history.length - 1]);
        }
        return history;
      });
      setPolygonStack((prevPolygonStack) => [...prevPolygonStack,lasthistory]);
    }
  },[history,polygons])

  const redo = useCallback(() => {
    if (polygonStack.length > 0) {
      const nextChange = polygonStack[polygonStack.length - 1];
      setPolygonStack((prevPolygonStack) => prevPolygonStack.slice(0, -1));
      if(nextChange === undefined) return;
      setHistory((prevHistory) =>(prevHistory? [...prevHistory, nextChange] : [nextChange] ) );
    }
  },[polygonStack,polygons])

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
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        {
          history[history.length - 1]?.map((polygon,index)=>(
            polygon.type === 'line' ? <Line key={index} {...polygon.polygon as LineData} /> : 
            polygon.type === 'polyline' ? <PolyLine key={index} {...polygon.polygon as PolyLineData} /> : 
            <Shape key={index} index={index} {...polygon.polygon as ShapeData}/>
          ))
        }
        <Line {...currentLine} />
        <Shape {...currentShape} />

        {/* {polyLine.map((polyline, index) => (
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
        ))} */}
      </svg>
      <div>
        <button id="undo" onClick={undo}>Undo</button>
        <button id="redo" onClick={redo}>Redo</button>
      </div>
    </div>
  );
};

export default Canvas;

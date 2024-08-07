"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {Shape,Line,PolyLine,Text} from './renderer';
import type { NextFont } from 'next/dist/compiled/@next/font';
import Quadtree from './Quadtree';

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
  fill: string;
}

interface toolBarProps{
  stylusColor: string;
  lineWidth: number;
  isPanning : boolean;
  setIsPanning: (isPanning: boolean) => void;
  tool: string;
  background: string;
  polygons: PolygonData[];
  font: NextFont;
  setPolygon: React.Dispatch<React.SetStateAction<PolygonData[]>>;
  fill: string;
  fontSize: number;
}

interface PolygonData{
  polygon: ShapeData | LineData | PolyLineData | textData;
  type: string;
}

interface textData{
  x1: number;
  y1: number;
  prompt : string;
  font: NextFont;
  color: string;
  fontSize: number;
}

const Canvas: React.FC<toolBarProps> = ({stylusColor,lineWidth,isPanning,setIsPanning,tool,background,polygons,setPolygon,font,fill,fontSize}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewBox, setViewBox] = useState([0, 0, window.innerWidth, window.innerHeight]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [polyLine,setPolyLine] = useState<PolyLineData|null>(null); 
  const [shapes,setShapes] = useState<ShapeData[]>([]);
  const [erasePaths,setErasePaths] = useState<LineData[]>([]);
  const [points,setPoints] = useState<string>('');
  const [currentLine, setCurrentLine] = useState<LineData|null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth,fill:fill});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [laserTimeout, setLaserTimeout] = useState<NodeJS.Timeout | null>(null);
  const [startPoint,setStartPoint] = useState<{x1:number,y1:number}>({x1:0,y1:0});
  const [history,setHistory] = useState<PolygonData[][]>([]);
  const [polygonStack,setPolygonStack] = useState<PolygonData[][]>([]);
  const [text,setText] = useState<textData|null>(null);
  const [isAddingText,setIsAddingText] = useState<boolean>(false);
  const [laserPaths, setLaserPaths] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedShapes,setSelectedShapes] = useState<PolygonData[]>([]);

  const quadtreeRef = useRef<Quadtree>(new Quadtree({ x: window.innerWidth/2, y: window.innerHeight/2, w: window.innerWidth/2, h: window.innerHeight/2 }, 4));

  useEffect(() => {
    const quadtree = quadtreeRef.current;
    quadtree.shapes = [];
    polygons.forEach(polygon => quadtree.insert(polygon));
  }, [polygons]);

  useEffect(() => {
    if(tool === 'pan'){
      svgRef.current?.classList.add('cursor-grab');
    }
    else{
      svgRef.current?.classList.remove('cursor-grab');
    }
  }, [viewBox]);

  useEffect(() => {
    if(selectedShapes.length > 0){
      console.log("SelectedShapes:",selectedShapes)
    }
  }, [selectedShapes]);

  useEffect(() => {
    if(history.length > 0){
      if(history[history.length - 1] !== polygons){
        setHistory((prevHistory) =>(prevHistory?[...prevHistory, polygons] : [polygons] ) );
        console.log("Polygons:",polygons);
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

  useEffect(() => {
    console.log('effect');
    const timeout = setTimeout(() => {
    const interval = setInterval(() => {
      setLaserPaths((prevLaserPaths) => {
        if (prevLaserPaths.length === 0) return prevLaserPaths;
  
        const updatedPaths = [...prevLaserPaths];
        const points = updatedPaths[0].split(',');
  
        if (points.length > 2) {
          points.shift();
          updatedPaths[0] = points.join(',');
        } else {
          updatedPaths.shift();
        }
  
        return updatedPaths;
      });
    }, 40);
  
    return () => clearInterval(interval);
    },1000)
    return () => clearTimeout(timeout);
  }, []);
  

  useEffect(() => {
    if(tool === 'pen'){
    setPolyLine({points:points,color:stylusColor,width:lineWidth})
    }
    if(tool === 'eraser'){
    setPolyLine({points:points,color:background,width:lineWidth})
    }
    if(tool === 'laser'){
    }
  },[points])

  useEffect(() => {
    console.log("Drawing:",isDrawing)
  },[isDrawing])

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
    if (e.button === 0) { 
      svgRef.current?.classList.add('cursor-grabbing');
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    }
    setIsDrawing(true);
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);
    if(tool==="select"){
      const selected = polygons.find((polygon)=> {
        if(polygon.type==='line'){
          const line = polygon.polygon as LineData;
          const d1 = Math.sqrt(Math.pow(x - line.x1, 2) + Math.pow(y - line.y1, 2));
          const d2 = Math.sqrt(Math.pow(x - line.x2, 2) + Math.pow(y - line.y2, 2));
          const d3 = Math.sqrt(Math.pow(line.x1 - line.x2, 2) + Math.pow(line.y1 - line.y2, 2));
            return Math.abs(d3 - (d1 + d2)) < 1;
        }
        else if(polygon.type==='polyline'){
          // const polyline = polygon.polygon as PolyLineData;
          // const points = polyline.points.split(",").map((point)=>point.split(" ").map((coord)=>parseInt(coord)));
          // // const distance = Math.sqrt(Math.pow(x - parseInt(points[0]), 2) + Math.pow(y - parseInt(points[1]), 2));
          // for(let i=0;i<points.length-1;i++){
          //   console.log(x,y," ",points[i][0],points[i][1])
          //   if(x===points[i][0] && y===points[i][1]){
          //     return true;
          //   }
          // }
          console.log("please update the function")
          return false;
        }
        else if(polygon.type === 'rectangle'){
          const shape = polygon.polygon as ShapeData;
          if(shape.width && shape.height){
          return x >= shape.x1 && x <= shape.x1 + shape.width && y >= shape.y1 && y <= shape.y1 + shape.height;
          }
        }
        else if(polygon.type === 'square'){
          const shape = polygon.polygon as ShapeData;
          if(shape.width && shape.height){
          return x >= shape.x1 && x <= shape.x1 + shape.width && y >= shape.y1 && y <= shape.y1 + shape.height;
          }
        }
        else if(polygon.type === 'circle'){
          const shape = polygon.polygon as ShapeData;
          if(shape.radius){
            const distance = Math.sqrt(Math.pow(x - shape.x1, 2) + Math.pow(y - shape.y1, 2));
            return distance <= shape.radius;
          }
        }
        else{
        }
        return false;
      });
      setSelectedShapes(selected?[selected]:[]);
    }
    if(tool === 'pen' || tool === 'eraser'){
      setPoints(`${x} ${y}`);
      setPolyLine({points:'',color:stylusColor,width:lineWidth})
    }
    else if(tool === 'laser'){
      setLaserPaths((prevPaths)=>[...prevPaths,`${x} ${y}`]);
    }
    else if(tool === 'line')
    {
      setCurrentLine({ x1: 0, y1: 0, x2: 0, y2: 0, color: stylusColor, width: lineWidth,opacity:1 })
    }
    else if(tool === 'text'){
      setIsAddingText(true);
      // svgRef.current?.focus();
      const svg = svgRef.current;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const cursorPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

      // setTextPosition({ x: cursorPoint.x, y: cursorPoint.y });
      // setTextInput('');
      setText({ x1: cursorPoint.x, y1: cursorPoint.y, prompt: '', font: font,color:stylusColor,fontSize:fontSize });
      requestAnimationFrame(() => textareaRef.current?.focus());
      // console.log("inputRef.current",inputRef.current)
      if (textareaRef.current) {
        textareaRef.current.style.left = `${cursorPoint.x}px`;
        textareaRef.current.style.top = `${cursorPoint.y}px`;
        textareaRef.current.focus();
      }
    }
    else if (tool === 'rectangle' || tool === 'square' || tool === 'circle') {
      setCurrentShape({
        x1: x,
        y1: y,
        type: tool,
        color: stylusColor,
        strokeWidth: lineWidth,
        width: 0,
        height: 0,
        radius: 0,
        fill:fill
      });
    }
    setStartPoint({x1:x,y1:y});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && text) {
      if(text.prompt){
        setText((prevText)=> {
          if(!prevText) return null;
          return { x1: prevText.x1, y1: prevText.y1, prompt: textareaRef.current?.value || '',font:font,color:stylusColor,fontSize:fontSize };
        })
        setPolygon((prevPolygon) => [...prevPolygon,{polygon: text,type: 'text'}]);
      }
      setText(null);
      setIsAddingText(false);
    }
    let x = parseInt(textareaRef.current!.style.height);
    if(e.key === 'Enter' && text){
      x=x+16;
      console.log("height:",x)
      textareaRef.current!.style.height = `${x}px`;
    }
  };

  useEffect(() => {
    if (isAddingText && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText((prevText) => {
      if (!prevText) return null;
      return { x1: prevText.x1, y1: prevText.y1, prompt: e.target.value,font:font,color:stylusColor,fontSize:fontSize };
    });
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
    if (!isDrawing){
      console.log("Cannot Draw",isDrawing)
      return;
    }
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect){ 
      console.log("SVG:",rect)
      return;
    }
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);
    console.log("Position:",x,y)
    // console.log("Tool:",tool)

    if(tool === 'line' && currentLine){
      console.log("CurrentLine:",currentLine)
      setCurrentLine({ x1: startPoint.x1, y1: startPoint.y1, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 });
      setLines((prevLines) => [...prevLines, currentLine]);
      console.log("polygons:",polygons.length)
    }
    else if(tool === 'pen' || tool === 'eraser'){
      setPoints((prevPoints)=>{
        const currentPoints = prevPoints + `,${x} ${y} `
        return currentPoints;
      })
      
    }
    else if(tool === 'laser'){
      setLaserPaths((prev) => {
        const newPaths = [...prev];
        console.log("Points:",newPaths);
        newPaths[newPaths.length - 1] = newPaths[newPaths.length - 1] + `,${x} ${y}`;
        return newPaths;
      });

    }
    if (tool === 'rectangle') {
      const width = x - startPoint.x1, height = y - startPoint.y1;
      console.log("StartPoint:", startPoint)
      setCurrentShape({...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth,fill:fill});
    } 
    else if (tool === 'square') {
      const side = Math.max(Math.abs(x - startPoint.x1), Math.abs(y - startPoint.y1));
      setCurrentShape({...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth,fill:fill});
      setShapes((prevShapes)=> [...prevShapes,{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth,fill:fill}]);
    } 
    else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPoint.x1, 2) + Math.pow(y - startPoint.y1, 2));
      setCurrentShape({...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth,fill:fill});
      setShapes((prevShapes)=> [...prevShapes,currentShape]);
    }
  };

  const fadeLaserLine = (points:string,opacity:number) => {
    const fadeStep = () => {
      setPoints((prevPoints)=>{
        return prevPoints.slice(0,prevPoints.length-1);
      })
    };
    fadeStep();
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if(tool === 'line'){
      console.log("Lines:",lines.length)
      if(currentLine){
      setLines((prevLines)=> [...prevLines,currentLine]);
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:currentLine,type:'line'}]);
      }
    }
    else if(tool === 'pen' && polyLine){
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:polyLine,type:'polyline'}]);
      setPoints('');
    }
    else if(tool === 'eraser' && polyLine){
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:polyLine,type:'polyline'}]);
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
      setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:currentShape,type:currentShape.type}] : [{polygon:currentShape,type:currentShape.type}]));
    }
    setPolygonStack([]);
    setIsDrawing(false);
    setCurrentShape({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth,fill:fill});
    setCurrentLine(null);
    setPolyLine(null);
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

  const undo = ()=>{
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
  }

  const redo = () => {
    if (polygonStack.length > 0) {
      const nextChange = polygonStack[polygonStack.length - 1];
      setPolygonStack((prevPolygonStack) => prevPolygonStack.slice(0, -1));
      if(nextChange === undefined) return;
      setHistory((prevHistory) =>(prevHistory? [...prevHistory, nextChange] : [nextChange] ) );
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width="100vw"
        height="100vh"
        className={`border border-gray-300 ${tool === 'pan' ? 'cursor-grab': tool ==='text' ? 'cursor-text' : 'cursor-crosshair'}`}
        viewBox={viewBox.join(' ')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
      >
        {
          history[history.length - 1]?.map((polygon,index)=>(
            polygon.type === 'line' ? <Line key={index} {...polygon.polygon as LineData} /> : 
            polygon.type === 'polyline' ? <PolyLine key={index} {...polygon.polygon as PolyLineData} /> : 
            polygon.type === 'text' ? <Text key={index} {...polygon.polygon as textData}/>:
            <Shape key={index} index={index} {...polygon.polygon as ShapeData}/>
          ))
        }
        {currentLine && <Line {...currentLine} />}
        <Shape {...currentShape} />
        {laserPaths.map((path, index) => (
          <PolyLine
            key={index}
            points={path}
            color="red"
            width={2}
          />
        ))}
        {polyLine!==null && <PolyLine {...polyLine} />} 
        
      </svg>
      {tool==="text" && isAddingText && (
        <textarea
          ref={textareaRef}
          value={text?.prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="absolute border border-gray-300 rounded px-3 py-1"
          style={{
            fontFamily: font.style.fontFamily,
            color: stylusColor,
            fontSize: fontSize,
            left: `${text!.x1-20}px`,
            top: `${text!.y1-20}px`,
          }}
        />
      )}
      <div>
        <button id="undo" onClick={undo}>Undo</button>
        <button id="redo" onClick={redo}>Redo</button>
      </div>
    </div>
  );
};

export default Canvas;

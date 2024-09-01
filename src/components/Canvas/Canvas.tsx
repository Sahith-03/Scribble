"use client"

import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import {DrawShape,DrawLine,DrawPolyLine,DrawText} from './renderer';
import { Stage, Layer, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { NextFont } from 'next/dist/compiled/@next/font';
import Konva from 'konva';
// import type { NextFont } from 'next/dist/compiled/@next/font';

interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  // index: number;
}

interface PolyLineData{
  points: number[];
  color: string;
  width: number;
  // index: number;
  type:string;
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
  // index: number;
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
  stageRef: React.RefObject<Konva.Stage>;
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
  // index: number;
}

const Canvas: React.FC<toolBarProps> = ({stylusColor,lineWidth,isPanning,setIsPanning,tool,background,polygons,setPolygon,font,fill,fontSize,stageRef}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // const [viewBox, setViewBox] = useState([0, 0, window.innerWidth, window.innerHeight]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [polyLine,setPolyLine] = useState<PolyLineData|null>(null); 
  const [shapes,setShapes] = useState<ShapeData[]>([]);
  const [points,setPoints] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState<LineData|null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth,fill:fill});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [startPoint,setStartPoint] = useState<{x1:number,y1:number}>({x1:0,y1:0});
  const [history,setHistory] = useState<PolygonData[][]>([]);
  const [polygonStack,setPolygonStack] = useState<PolygonData[][]>([]);
  const [text,setText] = useState<textData|null>(null);
  const [isAddingText,setIsAddingText] = useState<boolean>(false);
  const [laserPaths, setLaserPaths] = useState<number[][]>([[]]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedShapes,setSelectedShapes] = useState<PolygonData[]>([]);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [drag,setDrag] = useState(false);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 }); // Stage position
  // const stageRef = useRef(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const transformer = transformerRef.current;
      const stage = stageRef.current;

      if (selectedId) {
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformer.nodes([selectedNode]);
          transformer.getLayer()?.batchDraw();
        }
      } else {
        transformer.nodes([]);
      }
    }
  }, [selectedId]);

  
  useEffect(() => {
    tool === 'select' ? setDrag(true) : setDrag(false);
    console.log(" :",drag);
  },[tool]);

  useEffect(() => {
    if(tool === 'pan'){
      canvasRef.current?.classList.add('cursor-grab');
    }
    else{
      canvasRef.current?.classList.remove('cursor-grab');
    }
  }, [offsetX, offsetY, scale, tool]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Redraw the shapes, lines, etc.
    shapes.forEach((shape) => {
      // Drawing logic here
    });
  }, [scale, offsetX, offsetY, shapes]);  

  useEffect(() => {
    console.log('effect');
    const timeout = setTimeout(() => {
    const interval = setInterval(() => {
      setLaserPaths((prevLaserPaths) => {
        if (prevLaserPaths.length === 0) return prevLaserPaths;
  
        var updatedPaths = [...prevLaserPaths];
        var points = updatedPaths[0];
        
        if (points.length > 2) {
          updatedPaths[0] = points.slice(2,);
          console.log(points.length);
        } else {
          console.log('removed!!')
          updatedPaths.shift();
        }
  
        return updatedPaths;
      });
    }, 30);
  
    return () => clearInterval(interval);
    },500)
    return () => clearTimeout(timeout);
  }, []);
  

  useEffect(() => {
    if(tool === 'pen'){
    setPolyLine({points:points,color:stylusColor,width:lineWidth,type:'polyline'});
    }
    if(tool === 'eraser'){
    setPolyLine({points:points,color:background,width:lineWidth,type:'polyline'});
    }
    if(tool === 'laser'){
    }
  },[points])

  useEffect(() => {
    console.log("Drawing:",isDrawing)
  },[isDrawing])

  const getTransformedCoordinates = (clientX: number, clientY: number) => {
    // const rect = canvasRef.current?.getBoundingClientRect();
    // if (!rect) return { x: 0, y: 0 };
    const x = (clientX - stagePosition.x) / scale;
    const y = (clientY - stagePosition.y) / scale;
    return { x, y };
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    console.log("Mouse Down:",e.evt.clientX,e.evt.clientY)
    const { x, y } = getTransformedCoordinates(e.evt.clientX, e.evt.clientY);
    // const rect = canvasRef.current?.getBoundingClientRect();
    // console.log("rect:",rect)
    // if (!rect) return;
    if(tool === 'pan'){
    if (e.evt.button === 0) { 
      canvasRef.current?.classList.add('cursor-grabbing');
      setIsPanning(true);
      setStartPan({x,y});
      return;
    }
    }
    setIsDrawing(true);
    if(tool === 'pen' || tool === 'eraser'){
      setPoints([x,y]);
      setPolyLine({points:points,color:stylusColor,width:lineWidth,type:"polyline"});
    }
    else if(tool === 'laser'){
      setLaserPaths((prevPaths)=>[...prevPaths,[x,y]]);
    }
    else if(tool === 'line')
    {
      setCurrentLine({ x1: 0, y1: 0, x2: 0, y2: 0, color: stylusColor, width: lineWidth,opacity:1 });
    }
    else if(tool === 'text'){
      setIsAddingText(true);
      // canvasRef.current?.focus();
      // const canvas = canvasRef.current;
      // if (!canvas) return;

      // const point = canvas.createSVGPoint();
      // point.x = e.evt.clientX;
      // point.y = e.evt.clientY;
      // const cursorPoint = point.matrixTransform(canvas.getScreenCTM()?.inverse());

      // const canvas = canvasRef.current;
      // if (!canvas) return;
      
      // const rect = canvas.getBoundingClientRect();
      
      // const x = (e.evt.clientX - rect.left) * (canvas.width / rect.width);
      // const y = (e.evt.clientY - rect.top) * (canvas.height / rect.height);
      
      const cursorPoint = { x, y }; // This is the equivalent of cursorPoint in the original SVG code
      

      // setTextPosition({ x: cursorPoint.x, y: cursorPoint.y });
      // setTextInput('');
      setText({ x1: cursorPoint.x, y1: cursorPoint.y, prompt: '', font: font,color:stylusColor,fontSize:fontSize});
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
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      textarea.style.width = 'auto'; 
      textarea.style.height = `${textarea.scrollHeight}px`; 
      textarea.style.width = `${textarea.scrollWidth}px`;
    }
    setText((prevText) => {
      if (!prevText) return null;
      return { x1: prevText.x1, y1: prevText.y1, prompt: e.target.value,font:font,color:stylusColor,fontSize:fontSize };
    });

  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    // if(tool === 'pan'){
    // if (isPanning && startPan) {
    //   const dx = e.evt.clientX - startPan.x;
    //   const dy = e.evt.clientY - startPan.y;
    //   // setViewBox([viewBox[0] - dx, viewBox[1] - dy, viewBox[2], viewBox[3]]);

    //   setOffsetX((prev) => prev + dx);
    //   setOffsetY((prev) => prev + dy);

    //   setStartPan({ x: e.evt.clientX, y: e.evt.clientY });
    //   return;
    // }
    if (!isDrawing){
      console.log("Cannot Draw",isDrawing)
      return;
    }
    // const rect = canvasRef.current?.getBoundingClientRect();
    // if (!rect){ 
    //   console.log("SVG:",rect)
    //   return;
    // }
    const { x, y } = getTransformedCoordinates(e.evt.clientX, e.evt.clientY);
    // const x = e.evt.clientX;
    // const y = e.evt.clientY;
    console.log("Position:",x,y)
    // console.log("Tool:",tool)

    if(tool === 'line' && currentLine){
      console.log("CurrentLine:",currentLine)
      setCurrentLine({ x1: startPoint.x1, y1: startPoint.y1, x2: x, y2: y, color: stylusColor, width: lineWidth,opacity:1 });
      setLines((prevLines) => [...prevLines, currentLine]);
      console.log("polygons:",polygons.length)
    }
    else if(tool === 'pen' || tool === 'eraser'){
      setPoints((prevPoints)=>{return [...prevPoints,x,y]});
      
    }
    else if(tool === 'laser'){
      setLaserPaths((prev) => {
        var newPaths = [...prev];
        console.log("Points:",newPaths);
        if(newPaths.length>0){
          newPaths[newPaths.length - 1] = [...newPaths[newPaths.length - 1], x, y];
        }
        else{
          newPaths[newPaths.length - 1] = [x,y]
        }
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

  // const fadeLaserLine = (points:string,opacity:number) => {
  //   const fadeStep = () => {
  //     setPoints((prevPoints)=>{
  //       return prevPoints.slice(0,prevPoints.length-1);
  //     })
  //   };
  //   fadeStep();
  // };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if(tool === 'line'){
      console.log("Lines:",lines.length)
      if(currentLine){
      setLines((prevLines)=> [...prevLines,currentLine]);
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:currentLine,type:'line'}]);
      }
    }
    else if(tool === 'pen' && polyLine){
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:polyLine,type:'polyline'}]);
      setPoints([]);
    }
    else if(tool === 'eraser' && polyLine){
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:polyLine,type:'polyline'}]);
      setPoints([]);
    }
    else if (isPanning && tool === 'pan') {
      console.log('Panning!!')
      canvasRef.current?.classList.remove('cursor-grabbing');
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
    setStartPan(null);
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05; // Scale factor
    const oldScale = scale;
    const mousePointTo = {
      x: e.evt.x / oldScale - stagePosition.x / oldScale,
      y: e.evt.y / oldScale - stagePosition.y / oldScale,
    };

    // Reverse the zoom direction here
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - e.evt.x / newScale) * newScale,
      y: -(mousePointTo.y - e.evt.y / newScale) * newScale,
    });
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.width = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.width = `${textarea.scrollWidth}px`;
    }
  }, [text]);

  const handleDragEnd = (e: any) => {
    // setStagePosition({
    //   x: e.target.x(),
    //   y: e.target.y(),
    // });
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
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      className={`border h-screen w-screen border-gray-300 ${tool === 'pan' ? 'cursor-grab': tool ==='text' ? 'cursor-text' : 'cursor-crosshair'}`}
      scaleX={scale}
      scaleY={scale}
      x={stagePosition.x}
      y={stagePosition.y}
      draggable={tool==='pan'? true : false}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragEnd={handleDragEnd}
      ref={stageRef}
    >
      <Layer>
        {
          history[history.length - 1]?.map((polygon, index) => (
            polygon.type === 'line' ? <DrawLine key={index} {...polygon.polygon as LineData} drag={tool==='select' ? true : false}/> : 
            polygon.type === 'polyline' ? <DrawPolyLine key={index} {...polygon.polygon as PolyLineData} drag={tool==='select' ? true : false}/> : 
            polygon.type === 'text' ? <DrawText key={index} {...polygon.polygon as textData} drag={tool==='select' ? true : false}/>:
            <DrawShape key={index} {...polygon.polygon as ShapeData} drag={tool==='select' ? true : false}/>
          ))
        }
        {currentLine && <DrawLine {...currentLine}/>}
        <DrawShape {...currentShape} drag={tool === 'select'}  />
        {laserPaths.map((path, index) => (
          <DrawPolyLine
            key={index}
            points={path}
            color="red"
            width={2}
            drag={drag}
          />
        ))}
        {polyLine !== null && <DrawPolyLine {...polyLine}/>} 
        <Transformer ref={transformerRef}/>
      </Layer>
    </Stage>
    {tool==="text" && isAddingText && (
      <textarea
        ref={textareaRef}
        value={text?.prompt}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className=" absolute border-npne outline-0 focus:ring-0 text-center"
        style={{
          resize: 'none',
          overflow:'hidden',
          fontFamily: font.style.fontFamily,
          color: stylusColor,
          fontSize: fontSize,
          left: `${text!.x1-100}px`,
          top: `${text!.y1-10}px`,
          whiteSpace: 'nowrap'
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

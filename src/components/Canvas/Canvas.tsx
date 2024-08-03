"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {Shape,Line,PolyLine,Text} from './renderer';
import type { NextFont } from 'next/dist/compiled/@next/font';
// import {Source_Code_Pro,Indie_Flower,Nunito} from 'next/font/google';
// import {source_code_pro,indie_flower,nunito} from '../fonts';

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
  // history: PolygonData[][];
  polygons: PolygonData[];
  font: NextFont;
  setPolygon: React.Dispatch<React.SetStateAction<PolygonData[]>>;
  fill: string;
  // setHistory: React.Dispatch<React.SetStateAction<PolygonData[][]>>;
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
}

const Canvas: React.FC<toolBarProps> = ({stylusColor,lineWidth,isPanning,setIsPanning,tool,background,polygons,setPolygon,font,fill}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState([0, 0, window.innerWidth, window.innerHeight]);
  // const [stylusColor, setStylusColor] = useState('#000000');
  // const [lineWidth, setLineWidth] = useState(2);
  const [lines, setLines] = useState<LineData[]>([]);
  const [polyLine,setPolyLine] = useState<PolyLineData|null>(null); 
  const [shapes,setShapes] = useState<ShapeData[]>([]);
  const [erasePaths,setErasePaths] = useState<LineData[]>([]);
  const [points,setPoints] = useState<string>('');
  const [currentLine, setCurrentLine] = useState<LineData|null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeData>({x1:0,y1:0,type:'',color:stylusColor,strokeWidth:lineWidth,fill:fill});
  const [startPan, setStartPan] = useState<{ x: number; y: number } | null>(null);
  const [laserTimeout, setLaserTimeout] = useState<NodeJS.Timeout | null>(null);
  // const [laserLines, setLaserLines] = useState<LineData[]>([]);
  // const [polygons,setPolygon] = useState<PolygonData[]>([]);
  const [startPoint,setStartPoint] = useState<{x1:number,y1:number}>({x1:0,y1:0});
  const [history,setHistory] = useState<PolygonData[][]>([]);
  const [polygonStack,setPolygonStack] = useState<PolygonData[][]>([]);
  const [text,setText] = useState<textData|null>(null);
  const [isAddingText,setIsAddingText] = useState<boolean>(false);
  const [laserPaths, setLaserPaths] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // useEffect(() => {
  //   const source_code_pro = Source_Code_Pro({weight:"400",subsets:["latin"]});
  //   const indie_flower = Indie_Flower({weight:"400",subsets:["latin"]});
  //   const nunito = Nunito({ weight: "400", subsets: ["latin"] });

  //   textareaRef.current?.classList.remove('Source_Code_Pro');
  //   textareaRef.current?.classList.remove('Indie_Flower');
  //   textareaRef.current?.classList.remove('Nunito');
  //   textareaRef.current?.classList.add(font);

  // },[font])

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
    }, 40); // Adjust the interval duration as needed
  
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
    // console.log("Points:",points)
  },[points])

  useEffect(() => {
    console.log("Drawing:",isDrawing)
  },[isDrawing])

  // useEffect(() => {
  //   console.log("laserPath:",laserPaths)
  // },[laserPaths])

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
    setIsDrawing(true);
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);
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
      // setText({ x1:x, y1:y, prompt: ''});
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
      setText({ x1: cursorPoint.x, y1: cursorPoint.y, prompt: '', font: font,color:stylusColor });
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
          return { x1: prevText.x1, y1: prevText.y1, prompt: textareaRef.current?.value || '',font:font,color:stylusColor };
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
      return { x1: prevText.x1, y1: prevText.y1, prompt: e.target.value,font:font,color:stylusColor };
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
    // }
    if (!isDrawing){
      // console.log("Drawing:",isDrawing)
      // console.log("CurrentLine:",currentLine)
      // console.log("CurrentShape:",currentShape)
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
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:currentLine,type:'line'}] : [{polygon:currentLine,type:'line'}]));
      // if(lines.length > 0){
      //   const lastLine = lines.pop();
      //   const lastPolygon = polygons.pop();
      //   // setLines(lines);
      // }
      console.log("polygons:",polygons.length)
      // setPolygon((prevPolygon)=>[...prevPolygon,{polygon:currentLine,type:'line'}]);
      // setCurrentLine({ x1: x, y1: y });
    }
    else if(tool === 'pen' || tool === 'eraser'){
      setPoints((prevPoints)=>{
        const currentPoints = prevPoints + `,${x} ${y} `
        return currentPoints;
      })
      
      // setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{points:points,color:stylusColor,width:lineWidth},type:'polyline'}] : [{polygon:{points:points,color:stylusColor,width:lineWidth},type:'polyline'}] ));
    }
    else if(tool === 'laser'){
      setLaserPaths((prev) => {
        const newPaths = [...prev];
        console.log("Points:",newPaths);
        newPaths[newPaths.length - 1] = newPaths[newPaths.length - 1] + `,${x} ${y}`;
        return newPaths;
      });
      // setPolyLine({points:points,color:'red',width:lineWidth})

    }
    
    // else if(tool === 'eraser'){
    //   setPoints(`${points} ${x},${y}`);
    //   setPolyLine({ points: points, color: background, width: lineWidth });
    //   setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{points:points,color:background,width:lineWidth},type:'polyline'}] : [{polygon:{points:points,color:background,width:lineWidth},type:'polyline'}] ));
    // }


    // else if (tool === 'laser') {
    //   if (!currentLine) return;
      // if(laserLines.length > 0){
      //   // setLaserLines(laserLines);
      // }
      // const newLaserLine: LineData = { x1: currentLine.x1, y1: currentLine.y1, x2: x, y2: y, color: 'red', width: lineWidth, opacity: 1 };
      // setLaserLines((prevLines) => [...prevLines, newLaserLine]);
      // setCurrentLine({ x1: x, y1: y });
      // if (laserTimeout) clearTimeout(laserTimeout);
      // setLaserTimeout(setTimeout(() => fadeLaserLine(newLaserLine), 100));
    // }

    // if(shapes.length > 0 && tool === 'rectangle' || tool === 'square' || tool === 'circle'){
    //   const lastShape = shapes.pop();
    //   // const lastPolygon = polygons.pop();
    //   setPolygon((prevPolygon)=> prevPolygon.slice(0,-1));
    // }
    if (tool === 'rectangle') {
      const width = x - startPoint.x1, height = y - startPoint.y1;
      console.log("StartPoint:", startPoint)
      setCurrentShape({...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth,fill:fill});
      // setShapes((prevShapes)=> [...prevShapes,{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth}])
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth},type:"rectangle"}] : [{polygon:{...startPoint, type: tool,width: width, height: height, color: stylusColor, strokeWidth: lineWidth},type:"rectangle"}]));
      
    } else if (tool === 'square') {
      const side = Math.max(Math.abs(x - startPoint.x1), Math.abs(y - startPoint.y1));
      setCurrentShape({...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth,fill:fill});
      setShapes((prevShapes)=> [...prevShapes,{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth,fill:fill}]);
      // setPolygon((prevPolygon)=>(prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth},type:"square"}] : [{polygon:{...startPoint, type: tool,width: side, height: side, color: stylusColor, strokeWidth: lineWidth},type:"square"}]));
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPoint.x1, 2) + Math.pow(y - startPoint.y1, 2));
      setCurrentShape({...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth,fill:fill});
      setShapes((prevShapes)=> [...prevShapes,currentShape]);
      // setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:{...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth},type:"circle"}] : [{polygon:{...startPoint, type: tool,radius:radius,color: stylusColor, strokeWidth: lineWidth},type:"circle"}]));
    }
    // useEffect(() => {
    
  // }, [shapes,polygons]);
    // setShapes((prevShapes)=> [...prevShapes,currentShape]);
  };

  const fadeLaserLine = (points:string,opacity:number) => {
    const fadeStep = () => {
      // setLaserLines((prevLines) => {
      //   const updatedLines = prevLines.map((l) => (l === line ? { ...l, opacity: l.opacity - 0.2 } : l));
      //   return updatedLines.filter((l) => l.opacity > 0);
      // });
      setPoints((prevPoints)=>{
        // const currentPoints = 
        return prevPoints.slice(0,prevPoints.length-1);
      })
      // if (opacity > 0) {
      //   requestAnimationFrame(fadeStep);
      // }
    };
    fadeStep();
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    // if(tool==='laser'){
    //     const lastLine = setLaserLines([]);
    // }
    if (tool === 'laser' && polyLine) {
      // if (laserTimeout) clearTimeout(laserTimeout);
      // setLaserTimeout(setTimeout(() => {
      //   console.log("Points:",points)
      //   const opacity = 1;
      //   if (currentLine) fadeLaserLine(points,opacity);
      // }, 100));
      // setLaserPaths((prevLaserPaths)=>{
      //   return [...prevLaserPaths,points];
      // });
      
      // setTimeout(() => {
        // setInterval(() => {
        //   // setPoints((prevPoints)=>{
        //   //   const currentPoints = prevPoints.split(',').slice(1,prevPoints.length-1).join(',');
        //   //   return currentPoints;
        //   // });
        //   setLaserPaths((prevLaserPaths)=>{
        //     console.log("Inside interval")
        //     const laser = prevLaserPaths[0].split(',').slice(1,prevLaserPaths[0].length-1).join(',');
        //     prevLaserPaths[0]=laser;
        //     return prevLaserPaths;
        //   })
        // }, 40);
    // }, 1000);
      // setPolygon((prevPolygon)=>[...prevPolygon,{polygon:polyLine,type:'polyline'}]);
      // setPoints('');
    }
    else if(tool === 'line'){
      console.log("Lines:",lines.length)
      if(currentLine){
      setLines((prevLines)=> [...prevLines,currentLine]);
      setPolygon((prevPolygon)=>[...prevPolygon,{polygon:currentLine,type:'line'}]);
      }// setHistory((prevHistory) => (prevHistory ? [...prevHistory,polygons] : [polygons]));
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
    // setShapes((prevShapes)=> [...prevShapes,currentShape]);
      setPolygon((prevPolygon)=>( prevPolygon ? [...prevPolygon,{polygon:currentShape,type:currentShape.type}] : [{polygon:currentShape,type:currentShape.type}]));
    }
    // setHistory((prevHistory) => (prevHistory ? [...prevHistory,polygons] : [polygons]));
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

  // const panCanvas = () => {
  //   setIsPanning(!isPanning);
  // };

  // const handleShapeClick = (index: number, e: React.MouseEvent<SVGCircleElement | SVGRectElement | SVGEllipseElement>) => {
  //   if (tool === 'eraser') {
  //     setShapes(shapes.filter((_, i) => i !== index));
  //   }
  // };

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
          // console.log("Las:",path),
          <PolyLine
            key={index}
            points={path}
            color="red"
            width={2}
          />
        ))}
        {polyLine!==null && <PolyLine {...polyLine} />} 
        
      </svg>
      {isAddingText && (
        <textarea
          ref={textareaRef}
          value={text?.prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="absolute text-2xl border border-gray-300 rounded px-3 py-1"
          style={{
            fontFamily: font.style.fontFamily,
            color: stylusColor,
            left: `${text!.x1-20}px`,
            top: `${text!.y1-20}px`,
          }}
        />
      )}
      {/* {tool === 'text' && text && (
        <input
          type="text"
          // value={text?.prompt}
          onChange={(e) => setText((prevText) => ({ ...prevText!, prompt: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') handleKeyDown(e.nativeEvent as KeyboardEvent) }}
          style={{
            position: 'absolute',
            left: `${text.x1}px`,
            top: `${text.y1}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )} */}
      <div>
        <button id="undo" onClick={undo}>Undo</button>
        <button id="redo" onClick={redo}>Redo</button>
      </div>
    </div>
  );
};

export default Canvas;

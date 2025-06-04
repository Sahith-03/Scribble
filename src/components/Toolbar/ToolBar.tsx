"use client"

import {useContext, useState} from 'react';
import "./ToolBar.css";
import SecondaryTools from './secondaryTools';
import { Button } from '../ui/button';
import { toolbarContext } from '../../app/page';
import { Pen,PenLine,RectangleHorizontal,Square,Circle,Hand,Type,MousePointerClick,Eraser,CircleDot,Undo,Redo } from 'lucide-react';
import { cn } from '@/lib/utils';

// interface ToolbarProps {
//   stylusColor: string;
//   setStylusColor: (color: string) => void;
//   lineWidth: number;
//   setLineWidth: (width: number) => void;
//   clearCanvas: () => void;
//   downloadImage: () => void;
//   // panCanvas: () => void;
//   selectTool: (tool: string) => void;
//   setFont: (font: NextFont) => void;
//   tool: string;
//   setFill: (fill: string) => void;
// }

const Toolbar: React.FC = ({
  // stylusColor,
  // setStylusColor,
  // lineWidth,
  // setLineWidth,
  // clearCanvas,
  // downloadImage,
  // // panCanvas,
  // selectTool,
  // setFont,
  // setFill,
  // tool
}) => {
  const {stylusColor, setStylusColor, lineWidth, setLineWidth,clearCanvas,downloadImage,selectTool,setFont,tool,setFill,undo,redo} = useContext(toolbarContext);
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStylusColor(e.target.value);
  };

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(parseInt(e.target.value));
  };

  const tools = [
    { id: "line", icon: <PenLine /> },
    { id: "rectangle", icon: <RectangleHorizontal /> },
    { id: "square", icon: <Square /> },
    { id: "circle", icon: <Circle /> },
    { id: "pen", icon: <Pen /> },
    { id: "text", icon: <Type /> },
    { id: "pan", icon: <Hand /> },
    { id: "select", icon: <MousePointerClick /> },
    { id: "eraser", icon: <Eraser /> },
    { id: "laser", icon: <CircleDot /> }
  ];

  const handleToolClick = (toolId: string) => {
    selectTool(toolId);
  };

  
  return (
    <>
    <div id="toolbar" className="fixed flex flex-col top-0 left-0 m-4 p-4 bg-white border border-gray-300 rounded shadow-lg space-y-2 z-10">

      {/* <div className="grid grid-cols-2 gap-3">
        <input type="radio" onClick={()=> {selectTool('laser')}} name="tool" id="laser" hidden/> 
        <label htmlFor="laser"> <CircleDot/> </label>
        <input type="radio" onClick={()=> {selectTool('line')}} name="tool" id="line" hidden/> 
        <label htmlFor="line"> <PenLine/> </label>
        <input type="radio" onClick={()=> {selectTool('rectangle')}} name="tool" id="rectangle" hidden />
        <label htmlFor="rectangle"> <RectangleHorizontal/> </label>
        <input type="radio" onClick={()=> {selectTool('square')}} name="tool" id="square" hidden />
        <label htmlFor="square"> <Square/> </label>
        <input type="radio" onClick={()=> {selectTool('circle')}} name="tool" id="circle" hidden />
        <label htmlFor="circle"> <Circle/> </label>
        <input type="radio" onClick={()=> {selectTool('pen')}} name="tool" id="pen" defaultChecked hidden />
        <label htmlFor="pen"><Pen/></label>
        <input type="radio" onClick={()=> {selectTool('text')}} name="tool" id="text" hidden />
        <label htmlFor="text"> <Type/> </label>
        <input type="radio" onClick={()=> {selectTool('pan')}} name="tool" id="pan" hidden />
        <label htmlFor="pan"> <Hand/> </label>
        <input type="radio" onClick={()=> {selectTool('select')}} name="tool" id="select" hidden />
        <label htmlFor="select"> <MousePointerClick/> </label>
        <input type="radio" onClick={()=> {selectTool('eraser')}} name="tool" id="eraser" hidden />
        <label htmlFor="eraser"> <Eraser/></label>
      </div> */}

      <div className="grid grid-cols-2 gap-3">
      {tools.map((x) => (
        <div key={x.id}>
          <input
            type="radio"
            onClick={() => handleToolClick(x.id)}
            name="tool"
            id={x.id}
            hidden
          />
          <label
            htmlFor={x.id}
            className={`flex items-center justify-center p-2 rounded cursor-pointer transition-colors duration-150 ${
              tool === x.id
                ? "bg-gray-900 text-white"
                : "bg-transparent hover:bg-gray-200 text-gray-900"
            }`}
          >
            {x.icon}
          </label>
        </div>
      ))}
    </div>

      <Button variant={'destructive'} onClick={clearCanvas}>Clear</Button>
      <Button onClick={downloadImage} className="bg-blue-600">Download</Button>
    
    </div>
    <SecondaryTools
      // stylusColor={stylusColor}
      // setStylusColor={setStylusColor}
      // lineWidth={lineWidth}
      // setLineWidth={setLineWidth}
      handleColorChange={handleColorChange}
      handleLineWidthChange={handleLineWidthChange}
      // setFont={setFont}
      // setFill = {setFill}
      // tool={tool}
      />
      <div className="fixed flex bottom-0 left-0 m-5 bg-white border border-gray-300 rounded shadow-lg z-10 history-bar">
        <button id="undo" onClick={undo} className='hover:bg-gray-300 transition-colors'><Undo/></button>
        <button id="redo" onClick={redo} className='hover:bg-gray-300 transition-colors'><Redo/></button>
      </div>
    </>
  );
};

export default Toolbar;

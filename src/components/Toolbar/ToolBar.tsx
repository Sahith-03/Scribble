"use client"

import React from 'react';
import "./ToolBar.css";

interface ToolbarProps {
  stylusColor: string;
  setStylusColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  clearCanvas: () => void;
  downloadImage: () => void;
  panCanvas: () => void;
  selectTool: (tool: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  stylusColor,
  setStylusColor,
  lineWidth,
  setLineWidth,
  clearCanvas,
  downloadImage,
  panCanvas,
  selectTool
}) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStylusColor(e.target.value);
  };

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(parseInt(e.target.value));
  };
  
  return (
    <div id="toolbar" className="fixed flex flex-col top-0 left-0 m-4 p-4 bg-white border border-gray-300 rounded shadow-lg space-y-2 z-10">
      
      {/* <button onClick={() => selectTool('pan')} className="focus:text-blue-800">
        Pan
      </button>
      <button onClick={() => selectTool('rectangle')} className="focus:text-blue-700">
        Rectangle
      </button>
      <button onClick={() => selectTool('square')} className="focus:text-blue-700">
        Square
      </button>
      <button onClick={() => selectTool('circle')} className="focus:text-blue-700">
        Circle
      </button>
      <button onClick={() => selectTool('laser')} className="focus:text-blue-700">
        Laser
      </button> */}

      <input type="radio" onClick={()=> {selectTool('laser')}} name="tool" id="laser" hidden/> 
      <label htmlFor="laser"> Laser </label>
      <input type="radio" onClick={()=> {selectTool('line')}} name="tool" id="line" hidden/> 
      <label htmlFor="line"> Line </label>
      <input type="radio" onClick={()=> {selectTool('rectangle')}} name="tool" id="rectangle" hidden />
      <label htmlFor="rectangle"> Rectangle </label>
      <input type="radio" onClick={()=> {selectTool('square')}} name="tool" id="square" hidden />
      <label htmlFor="square"> Square </label>
      <input type="radio" onClick={()=> {selectTool('circle')}} name="tool" id="circle" hidden />
      <label htmlFor="circle"> Circle </label>
      <input type="radio" onClick={()=> {selectTool('pen')}} name="tool" id="pen" hidden />
      <label htmlFor="pen"> Pen </label>
      <input type="radio" onClick={()=> {selectTool('pan')}} name="tool" id="pan" hidden />
      <label htmlFor="pan"> Pan </label>
      <input type="radio" onClick={()=> {selectTool('eraser')}} name="tool" id="eraser" hidden />
      <label htmlFor="eraser"> Eraser </label>
      
      
      <input
        type="color"
        value={stylusColor}
        onChange={handleColorChange}
        className="rounded "
      />
      <input
        type="range"
        min="1"
        max="10"
        value={lineWidth}
        onChange={handleLineWidthChange}
        className="pl-1 rounded"
      />
      <button onClick={clearCanvas} className="p-2 bg-red-500 text-white rounded">
        Clear
      </button>
      {/* <button onClick={panCanvas} className="p-2 bg-gray-500 text-white rounded">
        Pan
      </button> */}
      <button onClick={downloadImage} className="p-2 bg-blue-500 text-white rounded">
        Download
      </button>
    </div>
  );
};

export default Toolbar;

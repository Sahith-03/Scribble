"use client"

import {useContext} from 'react';
import "./ToolBar.css";
import SecondaryTools from './secondaryTools';
import { toolbarContext } from '../../app/page';
import { Button } from '../ui/button';

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
  const {stylusColor, setStylusColor, lineWidth, setLineWidth,clearCanvas,downloadImage,selectTool,setFont,tool,setFill} = useContext(toolbarContext);
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStylusColor(e.target.value);
  };

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(parseInt(e.target.value));
  };
  
  return (
    <>
    <div id="toolbar" className="fixed flex flex-col top-0 left-0 m-4 p-4 bg-white border border-gray-300 rounded shadow-lg space-y-2 z-10">

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
      <input type="radio" onClick={()=> {selectTool('pen')}} name="tool" id="pen" defaultChecked hidden />
      <label htmlFor="pen"> Pen </label>
      <input type="radio" onClick={()=> {selectTool('text')}} name="tool" id="text" hidden />
      <label htmlFor="text"> Text </label>
      <input type="radio" onClick={()=> {selectTool('pan')}} name="tool" id="pan" hidden />
      <label htmlFor="pan"> Pan </label>
      <input type="radio" onClick={()=> {selectTool('select')}} name="tool" id="select" hidden />
      <label htmlFor="select"> Select </label>
      <input type="radio" onClick={()=> {selectTool('eraser')}} name="tool" id="eraser" hidden />
      <label htmlFor="eraser"> Eraser </label>
      
      <Button onClick={clearCanvas} variant="destructive">Clear</Button>
      <button onClick={downloadImage} className="p-2 bg-blue-500 text-white rounded">
        Download
      </button>
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
    </>
  );
};

export default Toolbar;

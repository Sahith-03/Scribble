"use client"

import React from 'react';
import {source_code_pro,indie_flower,nunito} from '../fonts';
import Image from 'next/image';
import { toolbarContext } from '@/app/page';

interface SecondaryToolsProps {
  // stylusColor: string;
  // setStylusColor: (color: string) => void;
  // lineWidth: number;
  // setLineWidth: (width: number) => void;
  handleColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLineWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // setFont: (font: NextFont) => void;
  // setFill: (fill:string)=>void;
  // tool: string;
};




const SecondaryTools: React.FC<SecondaryToolsProps> = ({
  // stylusColor,
  // setStylusColor,
  // lineWidth,
  // setLineWidth,
  handleColorChange,
  handleLineWidthChange,
  // tool,
  // setFill,
  // setFont 
}) => {
  const {stylusColor, setStylusColor, lineWidth, setLineWidth,tool,setFill,setFont,setFontSize} = React.useContext(toolbarContext);
  return (
    <div id="secondary-tools" className="fixed flex flex-col top-0 right-0 m-4 p-4 bg-white border border-gray-300 rounded shadow-lg space-y-2 z-10">
        {!["laser","pan","eraser"].includes(tool) && <div className="flex flex-col ">
          <label htmlFor="" className="text-sm pb-1">Outline Color</label>
          <input
          type="color"
          value={stylusColor}
          onChange={handleColorChange}
          />
        </div>}        
      <div className="flex flex-col">
      {["circle","square","rectangle","line","pen","eraser"].includes(tool) && 
          <div className=''>
            <label htmlFor="" className="text-sm">Line Width</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={handleLineWidthChange}
              className="pl-1 rounded w-full h-6"
            />
          </div>
      }
      </div>
      {tool==="text" &&
      <div>
        <label htmlFor="" className="text-sm">Font Family</label>
        <div className='flex justify-center text-2xl gap-5 mb-2'>
        
          <input type="radio" onClick={()=>{setFont(source_code_pro)}} id="code" name='font' hidden/>
          <label htmlFor="code" className={source_code_pro.className}>Aa</label>
        
          <input type="radio" onClick={()=>{setFont(nunito)}} id="normal" name='font' defaultChecked hidden/>
          <label htmlFor="normal" className={nunito.className}>Aa</label>
        
          <input type="radio" onClick={()=>{setFont(indie_flower)}} id="handwriting" name='font' hidden/>
          <label htmlFor="handwriting" className={indie_flower.className}>Aa</label>

        </div> 
        <label htmlFor="" className='text-sm'>Font Size</label>
        <div className='flex justify-around items-end'>

          <input type="radio" onClick={()=>{setFontSize(14)}} id="small" name="fontSize" hidden/>
          <label htmlFor="small" className='text-base'>Aa</label>    

          <input type="radio" onClick={()=>{setFontSize(18)}} id="medium" name="fontSize" hidden defaultChecked/>
          <label htmlFor="medium" className='text-lg'>Aa</label>    

          <input type="radio" onClick={()=>{setFontSize(24)}} id="large" name="fontSize" hidden/>
          <label htmlFor="large" className='text-2xl'>Aa</label>    
        </div>
        </div>
      }
      {["circle","square","rectangle"].includes(tool) &&
        <div className='flex flex-col'>
          <label htmlFor="fill" className="text-sm">Fill</label>
          <div className='flex gap-5'>
            <div>
              <input type="color" onChange={(e)=>{setFill(e.target.value)}} id="multi-color" value='#ffffff' name='fill' className="outline-none w-7 h-7 border-0 rounded-xl p-0"/>
              <label htmlFor=""></label>
            </div>
            <label htmlFor="transparent"><Image src='/transparent-full.jpg' width={25} height={25} alt="transparent" className='rounded cursor-pointer'/></label>
            <input type="button" onClick={(e)=>{setFill("none")}} id="transparent" name="fill"/>
          </div>
        </div>
      }
      <button className="bg-blue-500 text-white rounded p-2" onClick={() => setLineWidth(2)}>Default</button>
    </div>
  );
}

export default SecondaryTools;
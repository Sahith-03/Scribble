"use client"

import React from 'react';
import {source_code_pro,indie_flower,nunito} from '../fonts';
import type { NextFont } from 'next/dist/compiled/@next/font';
import transparentImage from '../../transparent.jpg'
import Image from 'next/image';

interface SecondaryToolsProps {
  stylusColor: string;
  setStylusColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  handleColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLineWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFont: (font: NextFont) => void;
  setFill: (fill:string)=>void;
  tool: string;
};




const SecondaryTools: React.FC<SecondaryToolsProps> = ({
  stylusColor,
  setStylusColor,
  lineWidth,
  setLineWidth,
  handleColorChange,
  handleLineWidthChange,
  tool,
  setFill,
  setFont // Rename the setFont parameter
}) => {

  return (
    <div id="secondary-tools" className="fixed flex flex-col top-0 right-0 m-4 p-4 bg-white border border-gray-300 rounded shadow-lg space-y-2 z-10">
        <div className="flex flex-col ">
        <label htmlFor="" className="text-sm pb-1">Outline Color</label>
        <input
        type="color"
        value={stylusColor}
        onChange={handleColorChange}
        className="rounded "
        />
        </div>        
      <div className="flex flex-col">
      {["circle","square","rectangle","line","pen"].includes(tool) && 
          <div>
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
        <div className='flex justify-center text-2xl gap-5'>
        
          <input type="radio" onClick={()=>{setFont(source_code_pro)}} id="code" name='font' hidden/>
          <label htmlFor="code" className={source_code_pro.className}>Aa</label>
        
          <input type="radio" onClick={()=>{setFont(nunito)}} id="normal" name='font' defaultChecked hidden/>
          <label htmlFor="normal" className={nunito.className}>Aa</label>
        
          <input type="radio" onClick={()=>{setFont(indie_flower)}} id="handwriting" name='font' hidden/>
          <label htmlFor="handwriting" className={indie_flower.className}>Aa</label>

        </div> 
        <div className='flex justify-around items-center'>

          <input type="radio" onClick={()=>{}} id="small" name="fontSize" hidden/>
          <label htmlFor="small" className='text-sm bg-red-300'>Aa</label>    

          <input type="radio" onClick={()=>{}} id="medium" name="fontSize" hidden/>
          <label htmlFor="medium" className='text-md bg-red-300'>Aa</label>    

          <input type="radio" onClick={()=>{}} id="large" name="fontSize" hidden/>
          <label htmlFor="large" className='text-lg bg-red-300'>Aa</label>    
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
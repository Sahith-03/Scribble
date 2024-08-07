"use client"

import React, { useState,useRef, useEffect,createContext} from 'react';
import Canvas from '../components/Canvas/Canvas';
import Toolbar from '../components/Toolbar/ToolBar';
import {nunito} from '../components/fonts';
import type { NextFont } from 'next/dist/compiled/@next/font';
import { clear } from 'console';


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

interface textData{
  x1:number;
  y1:number;
  prompt: string;
  font: NextFont;
  color: string;
  fontSize: number;
}

interface PolygonData{
  polygon: ShapeData | LineData | PolyLineData | textData;
  type: string;
}

export const toolbarContext = createContext({
  stylusColor: '#000000',
  setStylusColor: (color: string) => {},
  lineWidth: 2,
  setLineWidth: (width: number) => {},
  tool: 'pen',
  selectTool: (tool: string) => {},
  font: nunito,
  setFont: (font: NextFont) => {},
  fill: 'none',
  setFill: (fill: string) => {},
  clearCanvas: () => {},
  downloadImage: () => {},
  setFontSize: (size: number) => {}
});

const Home: React.FC = () => {
  const [stylusColor, setStylusColor] = useState('#000000');
  const divRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [isPanning, setIsPanning] = useState(false);
  const [tool, selectTool] = useState('pen');
  const [polygons,setPolygon] = useState<PolygonData[]>([]);
  const [font, setFont] = useState(nunito);
  const [fill, setFill] = useState('none');
  const [fontSize,setFontSize] = useState(18);
  // const [history, setHistory] = useState<PolygonData[][]>([]);



  const clearCanvas = () => {
    setPolygon([]); 
  };

  const downloadImage = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'drawing.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const panCanvas = () => {
    setIsPanning(!isPanning);
    console.log('Panning:', isPanning);
  };


  const getBackground = () => {
    const background = divRef.current?.style.color;
    return background || '#ffffff';
  }

  return (
    <>
    <div ref={divRef} className="flex flex-col items-center">
      <toolbarContext.Provider value={{stylusColor, setStylusColor, lineWidth, setLineWidth, tool, selectTool, font, setFont, fill, setFill,clearCanvas,downloadImage,setFontSize}}>
      <Toolbar
        // stylusColor={stylusColor}
        // setStylusColor={setStylusColor}
        // lineWidth={lineWidth}
        // setLineWidth={setLineWidth}
        // clearCanvas={clearCanvas}
        // downloadImage={downloadImage}
        // selectTool={selectTool}
        // setFont={setFont}
        // tool={tool}
        // setFill={setFill}
      />
      </toolbarContext.Provider>
      <Canvas 
      stylusColor={stylusColor}
      lineWidth={lineWidth}
      isPanning={isPanning}
      setIsPanning={setIsPanning}
      tool={tool}
      background={getBackground()}
      polygons={polygons}
      setPolygon={setPolygon}
      font={font}
      fill={fill}
      fontSize={fontSize}
      // history={history}
      // setHistory={setHistory}
      />
    </div>
    </>
  );
};

export default Home;

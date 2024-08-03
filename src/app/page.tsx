"use client"

import React, { useState,useRef, useEffect} from 'react';
import Canvas from '../components/Canvas/Canvas';
import Toolbar from '../components/Toolbar/ToolBar';
import {source_code_pro,indie_flower,nunito} from '../components/fonts';
import type { NextFont } from 'next/dist/compiled/@next/font';


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
}

interface PolygonData{
  polygon: ShapeData | LineData | PolyLineData | textData;
  type: string;
}


const Home: React.FC = () => {
  const [stylusColor, setStylusColor] = useState('#000000');
  const divRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [isPanning, setIsPanning] = useState(false);
  const [tool, selectTool] = useState('text');
  const [polygons,setPolygon] = useState<PolygonData[]>([]);
  const [font, setFont] = useState(nunito);
  const [fill, setFill] = useState('#ffffff');
  // const [history, setHistory] = useState<PolygonData[][]>([]);

  const clearCanvas = () => {
    // const canvas = document.querySelector('svg');
    // if (canvas) {
    //   const lines = canvas.querySelectorAll('line');
    //   lines.forEach(line => line.remove());
    //   const shapes = canvas.querySelectorAll('rect, circle');
    //   shapes.forEach(shape => shape.remove());
    //   const polylines = canvas.querySelectorAll('polyline');
    //   polylines.forEach(polyline => polyline.remove());
    // }
    setPolygon([]);
    // setHistory((prevHistory) => [...prevHistory, []]); 
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

  // const cursor = () => {
  //   const canvas = document.querySelector('svg');
  //   if (isPanning) {
  //     return 'grab';
  //   }
  //   if (tool === 'pan') {
  //     return 'crosshair';
  //   }
  //   return 'default';
  // }

  return (
    <>
    <div ref={divRef} className="flex flex-col items-center">
      <Toolbar
        stylusColor={stylusColor}
        setStylusColor={setStylusColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        clearCanvas={clearCanvas}
        downloadImage={downloadImage}
        // panCanvas={panCanvas}
        selectTool={selectTool}
        setFont={setFont}
        tool={tool}
        setFill={setFill}
      />
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
      // history={history}
      // setHistory={setHistory}
      />
    </div>
    </>
  );
};

export default Home;

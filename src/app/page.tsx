"use client"

import React, { useState,useRef, useEffect} from 'react';
import Canvas from '../components/Canvas/Canvas';
import Toolbar from '../components/Toolbar/ToolBar';

const Home: React.FC = () => {
  const [stylusColor, setStylusColor] = useState('#000000');
  const divRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [isPanning, setIsPanning] = useState(false);
  const [tool, selectTool] = useState('pen');

  const clearCanvas = () => {
    const canvas = document.querySelector('svg');
    if (canvas) {
      const lines = canvas.querySelectorAll('line');
      lines.forEach(line => line.remove());
      const shapes = canvas.querySelectorAll('rect, circle');
      shapes.forEach(shape => shape.remove());
    }
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
      <Toolbar
        stylusColor={stylusColor}
        setStylusColor={setStylusColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        clearCanvas={clearCanvas}
        downloadImage={downloadImage}
        panCanvas={panCanvas}
        selectTool={selectTool}
      />
      <Canvas 
      stylusColor={stylusColor}
      lineWidth={lineWidth}
      isPanning={isPanning}
      setIsPanning={setIsPanning}
      tool={tool}
      background={getBackground()}
      />
    </div>
    </>
  );
};

export default Home;

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Curves, CurvePoint } from '../types';

interface CurvesToolProps {
  curves: Curves;
  onCurvesChange: (curves: Curves) => void;
}

type Channel = keyof Curves;

const SIZE = 256;

// Helper to generate a smooth SVG path from points
function getPathData(points: CurvePoint[]): string {
    if (points.length < 2) return '';
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);

    let path = `M ${sortedPoints[0].x},${SIZE - sortedPoints[0].y}`;
    for (let i = 0; i < sortedPoints.length - 1; i++) {
        const p1 = sortedPoints[i];
        const p2 = sortedPoints[i+1];
        const cp1_x = p1.x + (p2.x - p1.x) / 3;
        const cp1_y = p1.y;
        const cp2_x = p2.x - (p2.x - p1.x) / 3;
        const cp2_y = p2.y;
        path += ` C ${cp1_x},${SIZE - cp1_y} ${cp2_x},${SIZE - cp2_y} ${p2.x},${SIZE - p2.y}`;
    }
    return path;
}


export const CurvesTool: React.FC<CurvesToolProps> = ({ curves, onCurvesChange }) => {
  const [activeChannel, setActiveChannel] = useState<Channel>('rgb');
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    input: number;
    output: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activePoints = curves[activeChannel];
  const pathData = useMemo(() => getPathData(activePoints), [activePoints]);
  
  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(SIZE, (e.clientX - rect.left) * (SIZE / rect.width)));
    const y = Math.max(0, Math.min(SIZE, SIZE - (e.clientY - rect.top) * (SIZE / rect.height)));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent, index: number | null) => {
    e.preventDefault();
    if (e.button !== 0) { // Ignore right-clicks for adding/dragging
        if (index !== null && (e.button === 2 || e.ctrlKey)) { // Right-click or Ctrl-click to delete
            if(index > 0 && index < activePoints.length - 1) {
                const newPoints = activePoints.filter((_, i) => i !== index);
                onCurvesChange({ ...curves, [activeChannel]: newPoints });
            }
        }
        return;
    };

    if (index !== null) {
      setDraggingPointIndex(index);
    } else { // Add a new point
      const { x, y } = getMousePos(e);
      const newPoint = { x, y };
      const newPoints = [...activePoints, newPoint].sort((a, b) => a.x - b.x);
      onCurvesChange({ ...curves, [activeChannel]: newPoints });
      setDraggingPointIndex(newPoints.findIndex(p => p === newPoint));
    }
  };

  const handlePointHover = (point: CurvePoint, index: number, isHovering: boolean) => {
    if (isHovering && !draggingPointIndex) {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: (point.x / SIZE) * rect.width,
            y: ((SIZE - point.y) / SIZE) * rect.height - 10,
            input: Math.round(point.x),
            output: Math.round(point.y),
        });
    } else {
        if (draggingPointIndex !== index) {
            setTooltip(null);
        }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingPointIndex === null) return;
    
    let { x, y } = getMousePos(e);

    if(draggingPointIndex === 0) x = 0;
    if(draggingPointIndex === activePoints.length - 1) x = 255;

    const newPoints = [...activePoints];
    const prevPoint = newPoints[draggingPointIndex - 1];
    const nextPoint = newPoints[draggingPointIndex + 1];
    if (prevPoint && x <= prevPoint.x) x = prevPoint.x + 0.01;
    if (nextPoint && x >= nextPoint.x) x = nextPoint.x - 0.01;
    
    newPoints[draggingPointIndex] = { x, y };
    
    onCurvesChange({ ...curves, [activeChannel]: newPoints });

    if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: (x / SIZE) * rect.width,
            y: ((SIZE - y) / SIZE) * rect.height - 10,
            input: Math.round(x),
            output: Math.round(y),
        });
    }
  };
  
  const handleMouseUp = () => {
    setDraggingPointIndex(null);
    setTooltip(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPointIndex, activePoints, activeChannel]);

  const channelConfig = {
    rgb: { color: 'white', bg: 'bg-gray-200 text-black' },
    r: { color: '#ef4444', bg: 'bg-red-500 text-white' },
    g: { color: '#22c55e', bg: 'bg-green-500 text-white' },
    b: { color: '#3b82f6', bg: 'bg-blue-500 text-white' },
  };

  return (
    <div className="flex flex-col gap-3" onContextMenu={(e) => e.preventDefault()}>
      <div
        className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-900"
        onMouseDown={(e) => handleMouseDown(e, null)}
      >
        {tooltip?.visible && (
             <div
                className="absolute bg-black/70 text-white text-xs font-mono rounded-md px-2 py-1 pointer-events-none transition-opacity transform -translate-x-1/2 -translate-y-full z-10 backdrop-blur-sm shadow-lg"
                style={{
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                }}
             >
                <div>In: {tooltip.input}</div>
                <div>Out: {tooltip.output}</div>
             </div>
        )}
        <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
          {/* Grid lines */}
          <path d="M 64 0 V 256 M 128 0 V 256 M 192 0 V 256 M 0 64 H 256 M 0 128 H 256 M 0 192 H 256" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d={`M 0 ${SIZE} L ${SIZE} 0`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 2" />
          
          {/* Curve Path */}
          <path d={pathData} stroke={channelConfig[activeChannel].color} strokeWidth="2" fill="none" />

          {/* Points */}
          {activePoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={SIZE - p.y}
              r={draggingPointIndex === i ? 7 : 5}
              fill={channelConfig[activeChannel].color}
              stroke={draggingPointIndex === i ? 'white' : 'rgba(0,0,0,0.5)'}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-75"
              onMouseDown={(e) => handleMouseDown(e, i)}
              onMouseEnter={() => handlePointHover(p, i, true)}
              onMouseLeave={() => handlePointHover(p, i, false)}
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(Object.keys(curves) as Channel[]).map(ch => (
            <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`py-1 text-sm font-bold rounded-md transition-all ${activeChannel === ch ? channelConfig[ch].bg : 'bg-zinc-700/70 hover:bg-zinc-700'}`}
            >
                {ch.toUpperCase()}
            </button>
        ))}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { X, Crop } from 'lucide-react';

export function SnippingTool({ onCapture }: { onCapture: (base64: string) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [screenCanvas, setScreenCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!isActive) {
        initiateSnip();
      }
    }
    if (e.key === 'Escape' && isActive) {
      cancelSnip();
    }
  }, [isActive]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const initiateSnip = async () => {
    // Add a tiny delay to ensure any UI interactions (like closing a menu) are finished
    await new Promise(r => setTimeout(r, 50));
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: window.devicePixelRatio || 1
      });
      setScreenCanvas(canvas);
      setIsActive(true);
    } catch (err) {
      console.error('Failed to capture screen:', err);
      alert('Failed to initiate snip.');
    }
  };

  const cancelSnip = () => {
    setIsActive(false);
    setScreenCanvas(null);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !screenCanvas) return;
    setIsDrawing(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width < 10 || height < 10) return cancelSnip();

    const scale = window.devicePixelRatio || 1;
    let finalWidth = width * scale;
    let finalHeight = height * scale;

    // Downscale if too large to save tokens (limit to max 800px on longest edge)
    const MAX_DIM = 800;
    if (finalWidth > MAX_DIM || finalHeight > MAX_DIM) {
      const resizeScale = MAX_DIM / Math.max(finalWidth, finalHeight);
      finalWidth = Math.floor(finalWidth * resizeScale);
      finalHeight = Math.floor(finalHeight * resizeScale);
    }

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = finalWidth;
    cropCanvas.height = finalHeight;
    
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return cancelSnip();

    ctx.drawImage(
      screenCanvas,
      x * scale, y * scale, width * scale, height * scale,
      0, 0, finalWidth, finalHeight
    );

    // Use lower quality jpeg to further reduce base64 size
    const base64Image = cropCanvas.toDataURL('image/jpeg', 0.6);
    onCapture(base64Image);
    cancelSnip();
  };



  if (!isActive || !screenCanvas) return null;

  const selectionStyle = isDrawing ? {
    left: Math.min(startPos.x, currentPos.x),
    top: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y)
  } : { left: 0, top: 0, width: 0, height: 0 };

  return (
    <div 
      className="fixed inset-0 z-[9999] cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        backgroundImage: `url(${screenCanvas.toDataURL()})`,
        backgroundSize: '100% 100%',
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      {isDrawing && (
        <div 
          className="absolute border-2 border-blue-500 bg-white/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
          style={{ ...selectionStyle, clipPath: 'inset(0 0 0 0)' }}
        >
          <div className="absolute top-0 left-0 w-2 h-2 bg-white border border-blue-500 -ml-1 -mt-1" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-white border border-blue-500 -mr-1 -mt-1" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border border-blue-500 -ml-1 -mb-1" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-blue-500 -mr-1 -mb-1" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow flex items-center gap-1 whitespace-nowrap">
            Release to capture {Math.round(selectionStyle.width)}x{Math.round(selectionStyle.height)}
          </div>
        </div>
      )}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-sm pointer-events-auto">
        <Crop className="w-4 h-4 text-blue-400" />
        <span>Drag to snip a region</span>
        <div className="w-px h-4 bg-gray-600 mx-1" />
        <button onClick={cancelSnip} className="flex items-center gap-1 hover:text-red-400 transition-colors">
          <X className="w-4 h-4" /> Cancel (Esc)
        </button>
      </div>
    </div>
  );
};

'use client';

import { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function ImageCropper({ 
  image, 
  cropWidth, 
  cropHeight, 
  onCropComplete, 
  aspectRatio = null 
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      setPosition({
        x: (cropWidth - img.width * zoom) / 2,
        y: (cropHeight - img.height * zoom) / 2
      });
    };
    img.src = image;
    imageRef.current = img;
  }, [image, zoom, cropWidth, cropHeight]);
  
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, cropWidth, cropHeight);
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, cropWidth, cropHeight);
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      position.x, position.y, imageRef.current.width * zoom, imageRef.current.height * zoom
    );
    
    ctx.strokeStyle = '#fa7be6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cropWidth, cropHeight);
  }, [position, zoom, imageSize, cropWidth, cropHeight]);
  
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    
    const prevWidth = imageSize.width * zoom;
    const prevHeight = imageSize.height * zoom;
    const newWidth = imageSize.width * newZoom;
    const newHeight = imageSize.height * newZoom;
    
    setPosition({
      x: position.x - (newWidth - prevWidth) / 2,
      y: position.y - (newHeight - prevHeight) / 2
    });
    
    setZoom(newZoom);
  };
  
  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const ctx = cropCanvas.getContext('2d');
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      position.x, position.y, imageRef.current.width * zoom, imageRef.current.height * zoom
    );
    
    cropCanvas.toBlob((blob) => {
      if (onCropComplete) {
        onCropComplete(blob, cropCanvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.95);
  };
  
  return (
    <div className="image-cropper">
      <div className="image-cropper-container">
        <canvas
          ref={canvasRef}
          width={cropWidth}
          height={cropHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        />
      </div>
      
      <div className="image-cropper-controls">
        <div className="image-cropper-zoom">
          <span>縮小</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
          />
          <span>拡大</span>
        </div>
        
        <div className="image-cropper-size-info">
          <div>サイズ: {cropWidth} x {cropHeight}px</div>
        </div>
        
        <Button onClick={handleCrop}>切り抜いて保存</Button>
      </div>
    </div>
  );
}

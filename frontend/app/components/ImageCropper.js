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
  
  const displayWidth = Math.max(cropWidth, 300);
  const displayHeight = Math.max(cropHeight, 300);
  
  const displayScale = Math.min(
    displayWidth / cropWidth,
    displayHeight / cropHeight
  );
  
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      const initialZoom = Math.min(
        cropWidth / img.width,
        cropHeight / img.height
      );
      
      if (initialZoom < 1) {
        setZoom(initialZoom * 0.9); // 少し余白を持たせる
      }
      
      setPosition({
        x: (displayWidth / displayScale - img.width * zoom) / 2,
        y: (displayHeight / displayScale - img.height * zoom) / 2
      });
    };
    img.src = image;
    imageRef.current = img;
  }, [image, cropWidth, cropHeight, displayWidth, displayHeight, displayScale]);
  
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    ctx.fillStyle = '#ffffff';
    const cropX = (displayWidth - cropWidth * displayScale) / 2;
    const cropY = (displayHeight - cropHeight * displayScale) / 2;
    ctx.fillRect(cropX, cropY, cropWidth * displayScale, cropHeight * displayScale);
    
    ctx.save();
    ctx.translate(cropX, cropY);
    ctx.scale(displayScale, displayScale);
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      position.x, position.y, imageRef.current.width * zoom, imageRef.current.height * zoom
    );
    ctx.restore();
    
    ctx.strokeStyle = '#fa7be6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth * displayScale, cropHeight * displayScale);
  }, [position, zoom, imageSize, cropWidth, cropHeight, displayWidth, displayHeight, displayScale]);
  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / displayScale;
    const y = (e.clientY - rect.top) / displayScale;
    
    setDragging(true);
    setDragStart({
      x: x - position.x,
      y: y - position.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / displayScale;
    const y = (e.clientY - rect.top) / displayScale;
    
    setPosition({
      x: x - dragStart.x,
      y: y - dragStart.y
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
    
    const cropX = (displayWidth - cropWidth * displayScale) / 2 / displayScale;
    const cropY = (displayHeight - cropHeight * displayScale) / 2 / displayScale;
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      position.x - cropX, position.y - cropY, imageRef.current.width * zoom, imageRef.current.height * zoom
    );
    
    cropCanvas.toBlob((blob) => {
      if (onCropComplete) {
        onCropComplete(blob, cropCanvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.95);
  };
  
  const minZoom = imageSize.width && imageSize.height ? 
    Math.min(0.1, cropWidth / imageSize.width / 2, cropHeight / imageSize.height / 2) : 0.1;
  
  return (
    <div className="image-cropper">
      <div className="image-cropper-container">
        <canvas
          ref={canvasRef}
          width={displayWidth}
          height={displayHeight}
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
            min={minZoom}
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

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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  const displayWidth = 300;
  const displayHeight = 300;
  
  const displayScale = Math.min(
    displayWidth / Math.max(cropWidth, 100),
    displayHeight / Math.max(cropHeight, 100)
  );
  
  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      let initialZoom;
      if (img.width < cropWidth || img.height < cropHeight) {
        initialZoom = Math.max(
          cropWidth / img.width,
          cropHeight / img.height
        ) * 1.1; // 少し余裕を持たせる
      } else {
        initialZoom = Math.min(
          cropWidth / img.width,
          cropHeight / img.height
        ) * 0.9; // 少し余白を持たせる
      }
      
      setZoom(initialZoom);
      
      setPosition({
        x: (cropWidth - img.width * initialZoom) / 2,
        y: (cropHeight - img.height * initialZoom) / 2
      });
    };
    
    img.src = image;
    imageRef.current = img;
  }, [image, cropWidth, cropHeight]);
  
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    const imgWidth = imageRef.current.width * zoom;
    const imgHeight = imageRef.current.height * zoom;
    
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    
    const drawX = centerX - (cropWidth / 2) + position.x;
    const drawY = centerY - (cropHeight / 2) + position.y;
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      drawX, drawY, imgWidth, imgHeight
    );
    
    const cropX = centerX - (cropWidth * displayScale / 2);
    const cropY = centerY - (cropHeight * displayScale / 2);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    ctx.clearRect(cropX, cropY, cropWidth * displayScale, cropHeight * displayScale);
    
    ctx.strokeStyle = '#fa7be6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth * displayScale, cropHeight * displayScale);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${cropWidth} x ${cropHeight}px`, cropX + 5, cropY + 20);
  }, [position, zoom, imageSize, cropWidth, cropHeight, displayWidth, displayHeight, displayScale, imageLoaded]);
  
  const handleMouseDown = (e) => {
    if (!canvasRef.current || !imageLoaded) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(true);
    
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!dragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    setPosition({
      x: newX,
      y: newY
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
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;
    
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const ctx = cropCanvas.getContext('2d');
    
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    
    const sourceX = centerX - (cropWidth / 2) - position.x;
    const sourceY = centerY - (cropHeight / 2) - position.y;
    
    const drawX = 0;
    const drawY = 0;
    
    ctx.drawImage(
      imageRef.current,
      0, 0, imageRef.current.width, imageRef.current.height,
      drawX - position.x, drawY - position.y, imageRef.current.width * zoom, imageRef.current.height * zoom
    );
    
    cropCanvas.toBlob((blob) => {
      if (onCropComplete) {
        onCropComplete(blob, cropCanvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.95);
  };
  
  const minZoom = imageSize.width && imageSize.height ? 
    Math.max(0.1, cropWidth / (imageSize.width * 2), cropHeight / (imageSize.height * 2)) : 0.1;
  
  const maxZoom = imageSize.width && imageSize.height ? 
    Math.max(3, cropWidth / (imageSize.width * 0.5), cropHeight / (imageSize.height * 0.5)) : 3;
  
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
            max={maxZoom}
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

'use client';

import { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function ImageCropper({
  image,
  cropWidth,
  cropHeight,
  onCropComplete,
  aspectRatio = null,
  className = '',
  sliderClassName = '',
  sizeLabelClassName = '',
  saveButtonClassName = '',
  saveButtonText = '切り抜いて保存',
  cancelButtonClassName = '',
  cancelButtonText = 'キャンセル',
  onCancel
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

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const getBounds = (currentZoom = zoom) => {
    const imgW = imageSize.width * currentZoom;
    const imgH = imageSize.height * currentZoom;
    const halfCropW = cropWidth / 2;
    const halfCropH = cropHeight / 2;
    const halfImgW = imgW / 2;
    const halfImgH = imgH / 2;
    const minX = Math.min(halfCropW - halfImgW, 0);
    const maxX = Math.max(halfImgW - halfCropW, 0);
    const minY = Math.min(halfCropH - halfImgH, 0);
    const maxY = Math.max(halfImgH - halfCropH, 0);
    return { minX, maxX, minY, maxY };
  };

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
        initialZoom = Math.max(cropWidth / img.width, cropHeight / img.height) * 1.1;
      } else {
        initialZoom = Math.min(cropWidth / img.width, cropHeight / img.height) * 0.9;
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
    const ctx = canvasRef.current.getContext('2d', { alpha: true });
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    const imgWidth = imageRef.current.width * zoom;
    const imgHeight = imageRef.current.height * zoom;
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    const drawX = centerX - cropWidth / 2 + position.x;
    const drawY = centerY - cropHeight / 2 + position.y;

    ctx.drawImage(
      imageRef.current,
      0,
      0,
      imageRef.current.width,
      imageRef.current.height,
      drawX,
      drawY,
      imgWidth,
      imgHeight
    );

    const cropX = centerX - (cropWidth * displayScale) / 2;
    const cropY = centerY - (cropHeight * displayScale) / 2;
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
    setDragStart({ x: e.clientX - rect.left - position.x, y: e.clientY - rect.top - position.y });

  };

  const handleMouseMove = (e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    const { minX, maxX, minY, maxY } = getBounds();
    setPosition({
      x: clamp(newX, minX, maxX),
      y: clamp(newY, minY, maxY)
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
    const { minX, maxX, minY, maxY } = getBounds(newZoom);
    setPosition({
      x: clamp(position.x - (newWidth - prevWidth) / 2, minX, maxX),
      y: clamp(position.y - (newHeight - prevHeight) / 2, minY, maxY)
    });
    setZoom(newZoom);
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const ctx = cropCanvas.getContext('2d', { alpha: true });

    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    const sourceX = centerX - cropWidth / 2 - position.x;
    const sourceY = centerY - cropHeight / 2 - position.y;

    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight

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
    <div className={`image-cropper ${className}`}>
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
          className={className}
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
            className={sliderClassName}
          />
          <span>拡大</span>
        </div>

        <div className={`image-cropper-size-info ${sizeLabelClassName}`}>
          <div>サイズ: {cropWidth} x {cropHeight}px</div>

        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
          <Button onClick={handleCrop} className={saveButtonClassName}>{saveButtonText}</Button>
          {onCancel && (
            <Button onClick={onCancel} className={cancelButtonClassName}>{cancelButtonText}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

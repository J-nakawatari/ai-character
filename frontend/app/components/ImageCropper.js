'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from './Button';

async function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, crop, width, height) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export default function ImageCropper({
  image,
  cropWidth,
  cropHeight,
  onCropComplete,
  className = '',
  sliderClassName = '',
  sizeLabelClassName = '',
  saveButtonClassName = '',
  saveButtonText = '切り抜いて保存',
  cancelButtonClassName = '',
  cancelButtonText = 'キャンセル',
  onCancel
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(image, croppedAreaPixels, cropWidth, cropHeight);
    const previewUrl = URL.createObjectURL(blob);
    onCropComplete && onCropComplete(blob, previewUrl);
  };

  return (
    <div className={`image-cropper ${className}`}>
      <div style={{ position: 'relative', width: 300, height: 300, background: '#333' }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={cropWidth / cropHeight}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>
      <div className="image-cropper-controls">
        <div className="image-cropper-zoom">
          <span>縮小</span>
          <input
            type="range"
            min={1}
            max={3}
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className={sliderClassName}
          />
          <span>拡大</span>
        </div>
        <div className={`image-cropper-size-info ${sizeLabelClassName}`}>サイズ: {cropWidth} x {cropHeight}px</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
          <Button onClick={handleSave} className={saveButtonClassName}>{saveButtonText}</Button>
          {onCancel && (
            <Button onClick={onCancel} className={cancelButtonClassName}>{cancelButtonText}</Button>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import styles from './ImageModal.module.css';

export default function ImageModal({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>

        <div className={styles.imageContainer}>
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt || ''}
            className={styles.modalImage}
          />
          
          {images.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={prevImage}
                aria-label="前の画像"
              >
                &#8249;
              </button>
              
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={nextImage}
                aria-label="次の画像"
              >
                &#8250;
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <div className={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`画像 ${index + 1}`}
            >
              <img
                src={image.src}
                alt={image.alt || ''}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
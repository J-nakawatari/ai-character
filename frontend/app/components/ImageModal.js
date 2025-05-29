'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ImageModal.module.css';

export default function ImageModal({ images, initialIndex, onClose, affinityLevel = 0 }) {
  // 解放済み画像のみをフィルタリング
  const unlockedImages = images.filter(image => !image.unlockLevel || image.unlockLevel <= affinityLevel);
  
  // initialIndexを解放済み画像のインデックスに変換
  const originalImage = images[initialIndex];
  const unlockedInitialIndex = unlockedImages.findIndex(img => img.src === originalImage?.src);
  
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, unlockedInitialIndex));
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const changeImage = (newIndex) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const nextImage = () => {
    const newIndex = currentIndex === unlockedImages.length - 1 ? 0 : currentIndex + 1;
    changeImage(newIndex);
  };

  const prevImage = () => {
    const newIndex = currentIndex === 0 ? unlockedImages.length - 1 : currentIndex - 1;
    changeImage(newIndex);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!unlockedImages || unlockedImages.length === 0) return null;

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
          {unlockedImages[currentIndex].isPremium && (
            <div className={styles.premiumBadge}>
              ⭐ PREMIUM
            </div>
          )}
          <img
            src={unlockedImages[currentIndex].src}
            alt={unlockedImages[currentIndex].alt || ''}
            className={`${styles.modalImage} ${isTransitioning ? styles.imageTransitioning : ''}`}
          />
          
          {unlockedImages.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={prevImage}
                aria-label="前の画像"
              >
                <Image
                  src="/icon/arrow.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.arrowIcon}
                />
              </button>
              
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={nextImage}
                aria-label="次の画像"
              >
                <Image
                  src="/icon/arrow.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={styles.arrowIcon}
                />
              </button>
            </>
          )}
        </div>

        {unlockedImages.length > 1 && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {unlockedImages.length}
          </div>
        )}

        <div className={styles.thumbnailContainer}>
          {unlockedImages.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`}
              onClick={() => changeImage(index)}
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
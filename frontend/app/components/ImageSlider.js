'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageSlider.module.css';

export default function ImageSlider({ images, interval = 5000, onImageClick, affinityLevel = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef(null);
  const imagesPerView = 5;

  useEffect(() => {
    if (!images || images.length <= imagesPerView || !isAutoPlaying) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, images, interval, isAutoPlaying]);

  const nextSlide = () => {
    if (!images || images.length === 0) return;
    const maxIndex = Math.max(0, images.length - imagesPerView);
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!images || images.length === 0) return;
    const maxIndex = Math.max(0, images.length - imagesPerView);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  const handleImageClick = (index) => {
    const image = images[index];
    const isLocked = image.unlockLevel && image.unlockLevel > affinityLevel;
    
    if (!isLocked && onImageClick) {
      onImageClick(index);
    }
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, images.length - imagesPerView);

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {images.length > imagesPerView && (
        <button
          onClick={prevSlide}
          className={`${styles.carouselButton} ${styles.prevButton}`}
          aria-label="前の画像グループ"
          disabled={currentIndex === 0}
        >
          <Image
            src="/icon/arrow.svg"
            alt=""
            width={20}
            height={20}
            className={styles.arrowIcon}
          />
        </button>
      )}
      
      <div className={styles.carouselViewport}>
        <div 
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentIndex * 20}%)` }}
          ref={scrollContainerRef}
        >
          {images.map((image, index) => {
            const isLocked = image.unlockLevel && image.unlockLevel > affinityLevel;
            return (
              <div key={index} className={styles.carouselSlide}>
                <div className={styles.imageWrapper}>
                  {image.isPremium && !isLocked && (
                    <div className={styles.premiumBadge}>
                      ⭐ PREMIUM
                    </div>
                  )}
                  <img
                    src={image.src}
                    alt={image.alt || ''}
                    className={`${styles.carouselImage} ${isLocked ? styles.lockedImage : ''}`}
                    onClick={() => handleImageClick(index)}
                  />
                  {isLocked && (
                    <div className={styles.lockOverlay}>
                      <Image
                        src="/icon/lock.svg"
                        alt="ロック"
                        width={32}
                        height={32}
                        className={styles.lockIcon}
                      />
                      <span className={styles.unlockText}>
                        Lv.{image.unlockLevel}で解放
                        {image.isPremium && <><br/>⭐ プレミア枠</>}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {images.length > imagesPerView && (
        <button
          onClick={nextSlide}
          className={`${styles.carouselButton} ${styles.nextButton}`}
          aria-label="次の画像グループ"
          disabled={currentIndex >= maxIndex}
        >
          <Image
            src="/icon/arrow.svg"
            alt=""
            width={20}
            height={20}
            className={styles.arrowIcon}
          />
        </button>
      )}
    </div>
  );
}
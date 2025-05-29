'use client';

import { useState, useEffect } from 'react';
import styles from './ImageSlider.module.css';

export default function ImageSlider({ images, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, images, interval]);

  const nextSlide = () => {
    if (!images || images.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (!images || images.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.imageWrapper}>
          <img
            src={images[0].src}
            alt={images[0].alt || ''}
            className={styles.slideImage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.imageWrapper}>
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || ''}
          className={`${styles.slideImage} ${isTransitioning ? styles.transitioning : ''}`}
        />
        
        <button
          onClick={prevSlide}
          className={`${styles.navButton} ${styles.prevButton}`}
          aria-label="前の画像"
        >
          &#8249;
        </button>
        
        <button
          onClick={nextSlide}
          className={`${styles.navButton} ${styles.nextButton}`}
          aria-label="次の画像"
        >
          &#8250;
        </button>
      </div>
      
      <div className={styles.dotsContainer}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
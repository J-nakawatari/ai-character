'use client';

import { useEffect, useState } from 'react';
import styles from './AffinityBar.module.css';

export default function AffinityBar({ level = 0, streak = 0, description }) {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    // アニメーション効果
    const timer = setTimeout(() => {
      setAnimatedLevel(level);
    }, 100);
    return () => clearTimeout(timer);
  }, [level]);

  const getGradientColor = (level) => {
    if (level >= 85) return 'linear-gradient(90deg, #FF69B4 0%, #FF1493 100%)';
    if (level >= 60) return 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
    if (level >= 40) return 'linear-gradient(90deg, #32CD32 0%, #228B22 100%)';
    if (level >= 20) return 'linear-gradient(90deg, #87CEEB 0%, #4682B4 100%)';
    return 'linear-gradient(90deg, #C0C0C0 0%, #808080 100%)';
  };

  return (
    <div className={styles.affinityContainer}>
      <div className={styles.affinityHeader}>
        <div className={styles.levelInfo}>
          <span className={styles.levelLabel}>親密度</span>
          <span className={styles.levelValue}>{level}</span>
          <span className={styles.levelMax}>/100</span>
        </div>
        {description && (
          <div className={styles.levelDescription} style={{ color: description.color }}>
            {description.title}
          </div>
        )}
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{
            width: `${animatedLevel}%`,
            background: getGradientColor(animatedLevel)
          }}
        />
      </div>
      
      {streak > 0 && (
        <div className={styles.streakInfo}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakText}>{streak}日連続訪問中！</span>
        </div>
      )}
    </div>
  );
}
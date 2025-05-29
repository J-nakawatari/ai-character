'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './AffinityBar.module.css';

export default function AffinityBar({ level = 0, streak = 0, description }) {
  const [animatedHearts, setAnimatedHearts] = useState(0);

  useEffect(() => {
    // ハートのアニメーション効果（レベル10ごとに1ハート）
    const targetHearts = Math.floor(level / 10);
    const timer = setTimeout(() => {
      setAnimatedHearts(targetHearts);
    }, 100);
    return () => clearTimeout(timer);
  }, [level]);

  const getHeartColor = (heartIndex, level) => {
    const heartsToFill = Math.floor(level / 10);
    const partialFill = level % 10;
    
    if (heartIndex < heartsToFill) {
      // 完全に塗りつぶされたハート
      if (level >= 85) return '#FF1493'; // ピンク（恋人）
      if (level >= 60) return '#FFD700'; // ゴールド（親友）
      if (level >= 40) return '#32CD32'; // グリーン（友達）
      if (level >= 20) return '#87CEEB'; // ライトブルー（知り合い）
      return '#FF69B4'; // 基本ピンク
    } else if (heartIndex === heartsToFill && partialFill > 0) {
      // 部分的に塗りつぶされたハート
      return '#FFB6C1'; // 薄いピンク
    }
    // 空のハート
    return '#E5E5E5';
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 10; i++) {
      const isAnimated = i < animatedHearts;
      hearts.push(
        <div 
          key={i} 
          className={`${styles.heartWrapper} ${isAnimated ? styles.heartAnimated : ''}`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Image
            src="/icon/heart.svg"
            alt=""
            width={20}
            height={20}
            className={styles.heartIcon}
            style={{ 
              color: getHeartColor(i, level),
              fill: getHeartColor(i, level)
            }}
          />
        </div>
      );
    }
    return hearts;
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
      
      <div className={styles.heartsContainer}>
        {renderHearts()}
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
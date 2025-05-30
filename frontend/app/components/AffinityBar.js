'use client';

import { useEffect, useState } from 'react';
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
      return 'rgb(248, 144, 182)'; // 指定されたピンク色
    } else if (heartIndex === heartsToFill && partialFill > 0) {
      // 部分的に塗りつぶされたハート
      return 'rgb(255, 229, 239)'; // 指定された薄いピンク色
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
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            className={styles.heartIcon}
            style={{ fill: getHeartColor(i, level) }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
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
      
      {/* 進捗バー */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${level}%` }}
          ></div>
        </div>
        <div className={styles.progressText}>
          {level}% 完了
        </div>
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
      
      {/* 親密度のメリット説明 */}
      <div className={styles.benefitsSection}>
        <div className={styles.benefitsHeader}>
          <span className={styles.benefitsIcon}>✨</span>
          <span className={styles.benefitsTitle}>親密度の特典</span>
        </div>
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>💬</span>
            <span className={styles.benefitText}>親密度が上がると話し方が徐々に変化</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>🖼️</span>
            <span className={styles.benefitText}>レベルアップで隠された画像を解放</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>💎</span>
            <span className={styles.benefitText}>親密度MAX時は特別なプレミアム画像が開放</span>
          </div>
        </div>
      </div>
    </div>
  );
}
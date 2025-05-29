'use client';

import styles from './AffinityInfo.module.css';

export default function AffinityInfo({ level = 0, description }) {
  return (
    <div className={styles.affinityInfo}>
      <span className={styles.affinityLabel}>親密度：</span>
      <span className={styles.affinityLevel}>{level}</span>
      <span className={styles.affinityMax}>/100</span>
      {description && (
        <span className={styles.affinityDescription}>{description.title}</span>
      )}
    </div>
  );
}
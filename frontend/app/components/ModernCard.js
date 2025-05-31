'use client';

import styles from './ModernCard.module.css';

const ModernCard = ({ 
  children, 
  className = '',
  variant = 'default',
  hover = true,
  padding = 'default'
}) => {
  const cardClasses = [
    styles.modernCard,
    styles[variant],
    styles[`padding-${padding}`],
    hover ? styles.hover : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default ModernCard;
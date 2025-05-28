import React from 'react';
import '../styles/button.css';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const classes = [
    'button',
    variant ? `button--${variant}` : '',
    size ? `button--${size}` : '',
    fullWidth ? 'button--fullWidth' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

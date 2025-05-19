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
  const baseClass = 'button';
  const variantClass = `button--${variant}`;
  const sizeClass = size !== 'md' ? `button--${size}` : '';
  const widthClass = fullWidth ? 'button--full' : '';
  
  const buttonClasses = [baseClass, variantClass, sizeClass, widthClass, className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}

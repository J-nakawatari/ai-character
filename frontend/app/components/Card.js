export default function Card({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) {
  const baseClass = 'card';
  const variantClass = variant !== 'default' ? `card--${variant}` : '';
  
  const cardClasses = [baseClass, variantClass, className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`card__body ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card__header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card__footer ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h2 className={`card__title ${className}`} {...props}>
      {children}
    </h2>
  );
}

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  className = '',
  size = 'md',
  ...props
}) {
  const baseClass = 'input';
  const sizeClass = size !== 'md' ? `input--${size}` : '';
  const errorClass = error ? 'input--error' : '';
  
  const inputClasses = [baseClass, sizeClass, errorClass, className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input__label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {error && <p className="input__error-message">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  placeholder = '',
  value,
  onChange,
  error,
  className = '',
  rows = 4,
  ...props
}) {
  const baseClass = 'input textarea';
  const errorClass = error ? 'input--error' : '';
  
  const textareaClasses = [baseClass, errorClass, className]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input__label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={textareaClasses}
        rows={rows}
        {...props}
      />
      {error && <p className="input__error-message">{error}</p>}
    </div>
  );
}

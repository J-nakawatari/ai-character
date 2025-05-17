export default function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`py-2 px-4 rounded-md font-bold bg-gradient-to-r from-[#43eafc] to-[#fa7be6] 
      text-white hover:shadow-[0_6px_24px_0_rgba(250,123,230,0.3),0_4px_12px_0_rgba(67,234,252,0.2)] 
      transition-all duration-200 relative overflow-hidden
      active:transform active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

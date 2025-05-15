export default function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`py-2 px-4 rounded-md bg-black text-white hover:bg-gray-800 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

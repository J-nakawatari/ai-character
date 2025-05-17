export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] 
    border border-[#e5e7eb] hover:shadow-[0_6px_32px_rgba(0,0,0,0.15)] 
    transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

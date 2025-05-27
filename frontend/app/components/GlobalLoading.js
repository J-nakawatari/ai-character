import '../styles/pages/setup.css';

export default function GlobalLoading({ text = "読込中..." }) {
  return (
    <div className="setup--loading-center">
      <div className="global-loading-spinner" aria-label="loading">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#75C6D1"
            strokeWidth="6"
            strokeDasharray="100 60"
            strokeLinecap="round"
            style={{ opacity: 0.3 }}
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#75C6D1"
            strokeWidth="6"
            strokeDasharray="60 100"
            strokeLinecap="round"
            style={{
              transformOrigin: 'center',
              animation: 'global-spinner-rotate 1s linear infinite',
            }}
          />
        </svg>
      </div>
      <p style={{ marginTop: 16 }}>{text}</p>
      <style jsx global>{`
        @keyframes global-spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .global-loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
} 
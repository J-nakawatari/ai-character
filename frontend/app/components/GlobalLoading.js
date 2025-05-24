import '../styles/pages/setup.css';

export default function GlobalLoading({ text = "読込中..." }) {
  return (
    <div className="setup--loading-center">
      <p>{text}</p>
    </div>
  );
} 
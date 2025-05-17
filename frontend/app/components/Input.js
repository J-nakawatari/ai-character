export default function Input({ label, id, error, ...props }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`w-full p-2 border rounded-md text-gray-800 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

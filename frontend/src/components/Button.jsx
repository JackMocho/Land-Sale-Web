// src/components/Button.jsx
export default function Button({ children, variant = "primary", type = "button", onClick, fullWidth = false, disabled = false }) {
  const baseClasses = "px-6 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500",
    secondary: "bg-yellow-500 text-blue-900 hover:bg-yellow-600 focus:ring-yellow-400",
    outline: "bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
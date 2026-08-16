const variants = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-300",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 disabled:bg-slate-100",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 disabled:bg-rose-300",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

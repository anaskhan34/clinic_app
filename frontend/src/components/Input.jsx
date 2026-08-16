export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  name,
  min,
  step,
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label && <span className="mb-1.5 block">{label}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-teal-400 focus:ring-3 focus:ring-teal-100"
      />
    </label>
  );
}

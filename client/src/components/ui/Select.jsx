import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    error,
    disabled = false,
    className = "",
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-[var(--space-1)] ${className}`}
    >
      {label && (
        <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          bg-[var(--color-bg-input)]
          text-[13px] font-normal
          border border-[var(--color-border-default)]
          rounded-[var(--radius-lg)]
          px-[14px] py-[var(--space-3)]
          shadow-[var(--shadow-sm)]
          transition-all duration-150 ease-in-out
          disabled:opacity-40 disabled:pointer-events-none
          ${isOpen ? "border-[var(--color-border-focus)]" : ""}
          ${error ? "border-[var(--color-error)]" : ""}
        `}
      >
        <span
          className={
            selectedOption
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-tertiary)]"
          }
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`text-[var(--color-text-tertiary)] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="
          absolute top-full left-0 right-0 z-40 mt-1
          bg-[var(--color-bg-card)]
          border border-[var(--color-border-default)]
          rounded-[var(--radius-lg)]
          shadow-[var(--shadow-md)]
          py-1 max-h-[200px] overflow-y-auto
        "
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-[14px] py-[var(--space-2)]
                text-[13px] font-normal
                transition-colors duration-150
                ${
                  opt.value === value
                    ? "text-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/5"
                    : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <span className="text-[11px] text-[var(--color-error)]">{error}</span>
      )}
    </div>
  );
});

export default Select;

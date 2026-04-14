import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      {label && (
        <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full
          bg-[var(--color-bg-input)]
          text-[var(--color-text-primary)] text-[13px] font-normal
          border border-[var(--color-border-default)]
          rounded-[var(--radius-lg)]
          px-[14px] py-[var(--space-3)]
          placeholder:text-[var(--color-text-tertiary)] placeholder:text-[13px]
          transition-all duration-150 ease-in-out
          focus:border-[var(--color-border-focus)] focus:outline-none
          disabled:opacity-40 disabled:pointer-events-none
          shadow-[var(--shadow-sm)]
          ${error ? "border-[var(--color-error)]" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-[var(--color-error)]">{error}</span>
      )}
    </div>
  );
});

export default Input;

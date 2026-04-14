import { forwardRef } from "react";

const variants = {
  primary:
    "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-brand-blue-mid)] active:bg-[var(--color-brand-blue-dark)] active:scale-[0.98]",
  secondary:
    "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)] hover:bg-red-600 active:scale-[0.98]",
  icon: "bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-blue-mid)] active:bg-[var(--color-brand-blue-dark)] active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-[11px] rounded-[var(--radius-sm)]",
  md: "px-4 py-2 text-[12px] rounded-[var(--radius-md)]",
  lg: "px-6 py-2.5 text-[14px] rounded-[var(--radius-md)]",
  icon: "w-[30px] h-[30px] rounded-[var(--radius-md)] flex items-center justify-center",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-[var(--space-2)]
        font-normal cursor-pointer select-none
        transition-all duration-150 ease-in-out
        disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;

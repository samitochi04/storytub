const variantStyles = {
  default: "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
  brand: "bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  error: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  outline:
    "bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-default)]",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center
        px-[var(--space-2)] py-[2px]
        text-[11px] font-normal leading-none
        rounded-[var(--radius-sm)]
        select-none whitespace-nowrap
        ${variantStyles[variant] || variantStyles.default}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

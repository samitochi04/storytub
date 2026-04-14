const sizeMap = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

export default function ProgressBar({
  value = 0,
  max = 100,
  size = "md",
  showLabel = false,
  label,
  className = "",
}) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`flex flex-col gap-[var(--space-1)] ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full rounded-full
          bg-[var(--color-border-default)]
          overflow-hidden
          ${sizeMap[size] || sizeMap.md}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-[var(--color-brand-blue)] transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

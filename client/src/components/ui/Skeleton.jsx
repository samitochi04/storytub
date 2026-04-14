export default function Skeleton({
  width,
  height = "16px",
  rounded = "var(--radius-md)",
  className = "",
}) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-border-default)] ${className}`}
      style={{
        width: width || "100%",
        height,
        borderRadius: rounded,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`flex flex-col gap-[var(--space-2)] ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="12px"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`
        bg-[var(--color-bg-card)]
        border border-[var(--color-border-default)]
        rounded-[var(--radius-lg)]
        p-[var(--space-3)]
        shadow-[var(--shadow-sm)]
        ${className}
      `}
    >
      <Skeleton height="120px" rounded="var(--radius-md)" />
      <div className="mt-[var(--space-3)] flex flex-col gap-[var(--space-2)]">
        <Skeleton height="14px" width="70%" />
        <Skeleton height="12px" width="90%" />
        <Skeleton height="12px" width="50%" />
      </div>
    </div>
  );
}

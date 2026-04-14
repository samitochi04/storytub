import { User } from "lucide-react";

const sizeMap = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-[12px]",
  lg: "w-10 h-10 text-[14px]",
  xl: "w-14 h-14 text-[18px]",
};

export default function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  className = "",
  ...props
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`
          rounded-[var(--radius-full)] object-cover
          ${sizeMap[size] || sizeMap.md}
          ${className}
        `}
        {...props}
      />
    );
  }

  return (
    <div
      className={`
        rounded-[var(--radius-full)]
        bg-[var(--color-bg-hover)]
        border border-[var(--color-border-default)]
        flex items-center justify-center
        text-[var(--color-text-secondary)] font-bold
        select-none
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
      {...props}
    >
      {initials || (
        <User
          size={
            size === "sm" ? 12 : size === "lg" ? 20 : size === "xl" ? 24 : 16
          }
          strokeWidth={1.5}
        />
      )}
    </div>
  );
}

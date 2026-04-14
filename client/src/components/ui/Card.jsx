import { forwardRef } from "react";

const Card = forwardRef(function Card(
  {
    children,
    hover = false,
    padding = true,
    className = "",
    as: Component = "div",
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={`
        bg-[var(--color-bg-card)]
        border border-[var(--color-border-default)]
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-sm)]
        transition-all duration-150 ease-in-out
        ${padding ? "p-[var(--space-3)]" : ""}
        ${hover ? "hover:bg-[var(--color-bg-hover)] hover:shadow-[var(--shadow-md)] cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Card;

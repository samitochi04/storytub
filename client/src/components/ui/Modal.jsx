import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "md",
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-3xl",
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`
          w-full ${sizeStyles[size] || sizeStyles.md}
          bg-[var(--color-bg-card)]
          border border-[var(--color-border-default)]
          rounded-[var(--radius-xl)]
          shadow-[var(--shadow-lg)]
          animate-in fade-in zoom-in-95
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-[var(--space-6)] py-[var(--space-4)] border-b border-[var(--color-border-default)]">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                w-7 h-7 flex items-center justify-center
                rounded-[var(--radius-sm)]
                text-[var(--color-text-tertiary)]
                hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]
                transition-all duration-150 ease-in-out
              "
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-[var(--space-6)] py-[var(--space-4)]">
          {children}
        </div>
      </div>
    </div>
  );
}

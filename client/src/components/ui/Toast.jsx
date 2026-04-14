import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success:
    "text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20",
  warning:
    "text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20",
  error:
    "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20",
  info: "text-[var(--color-info)] bg-[var(--color-info)]/10 border-[var(--color-info)]/20",
};

export default function Toast({
  message,
  type = "info",
  duration = 4000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = iconMap[type] || iconMap.info;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 150);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        flex items-center gap-[var(--space-3)]
        px-[var(--space-4)] py-[var(--space-3)]
        rounded-[var(--radius-lg)]
        border
        shadow-[var(--shadow-md)]
        transition-all duration-150 ease-in-out
        ${colorMap[type] || colorMap.info}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
      role="alert"
    >
      <Icon size={18} strokeWidth={1.5} className="shrink-0" />
      <span className="text-[12px] font-normal text-[var(--color-text-primary)] flex-1">
        {message}
      </span>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 150);
          }}
          className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

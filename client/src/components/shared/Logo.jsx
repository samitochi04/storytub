/**
 * StoryTub Logo Mark + Wordmark
 *
 * Mark: 3 stacked rounded shapes in brand blue (#1b17ff)
 *   Layer 1 (top):    Circle, ~24px diameter
 *   Layer 2 (middle): Pill/stadium, ~64px wide x 20px tall
 *   Layer 3 (bottom): Pill/stadium, ~88px wide x 20px tall
 *   Gap between shapes: 6px
 *
 * Wordmark: "StoryTub" in Inter Light (300), mixed case
 */

export function LogoMark({ size = 40, className = "" }) {
  // Scale factor based on default viewBox height of 70
  const scale = size / 70;
  const width = Math.round(88 * scale);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 88 70"
      fill="none"
      className={className}
      aria-label="StoryTub logo"
      role="img"
    >
      {/* Layer 1: Top circle */}
      <circle cx="44" cy="12" r="12" fill="#1b17ff" />
      {/* Layer 2: Middle pill */}
      <rect x="12" y="30" width="64" height="14" rx="7" fill="#1b17ff" />
      {/* Layer 3: Bottom pill */}
      <rect x="0" y="50" width="88" height="14" rx="7" fill="#1b17ff" />
    </svg>
  );
}

export function LogoIcon({ size = 32, className = "" }) {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-black rounded-[var(--radius-md)]
        ${className}
      `}
      style={{ width: size, height: size }}
    >
      <LogoMark size={size * 0.55} />
    </div>
  );
}

export default function Logo({ showText = true, size = 32, className = "" }) {
  return (
    <div className={`flex items-center gap-[var(--space-6)] ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span
          className="text-[var(--color-text-primary)] tracking-tight select-none"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: size * 0.55,
          }}
        >
          StoryTub
        </span>
      )}
    </div>
  );
}

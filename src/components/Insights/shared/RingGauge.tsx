/**
 * RingGauge — SVG circular score gauge (0–100).
 * Colour: red <50 · amber 50–89 · teal ≥90
 * Pure SVG, no external library.
 */

interface RingGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showScore?: boolean;
  label?: string;
}

export function RingGauge({
  score,
  size = 96,
  strokeWidth,
  showScore = true,
  label,
}: RingGaugeProps) {
  const sw   = strokeWidth ?? Math.round(size * 0.09);
  const r    = (size - sw) / 2;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ;

  const color =
    score >= 90 ? "#0d9488"  // teal-600
    : score >= 50 ? "#f59e0b" // amber-400
    : "#ef4444";              // red-500

  const textSize = Math.round(size * 0.24);
  const labelSize = Math.round(size * 0.12);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG ring — rotated so arc starts at top (12-o-clock) */}
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={sw}
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score label centred inside the ring */}
        {showScore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-bold text-gray-900 tabular-nums leading-none"
              style={{ fontSize: textSize }}
            >
              {score}
            </span>
          </div>
        )}
      </div>

      {label && (
        <span
          className="text-gray-500 font-medium text-center leading-tight"
          style={{ fontSize: labelSize }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * SparkLine — 7-bar mini trend chart, pure CSS.
 * Last bar is highlighted in teal. No external dependency.
 */

interface SparkLineProps {
  data: number[];
  height?: number;        // px, default 28
  highlightLast?: boolean;
  color?: string;         // Tailwind bg class for non-last bars
}

export function SparkLine({
  data,
  height = 28,
  highlightLast = true,
  color = "bg-gray-300",
}: SparkLineProps) {
  const max = Math.max(...data, 1);

  return (
    <div
      className="flex items-end gap-px"
      style={{ height }}
      aria-hidden="true"
    >
      {data.map((v, i) => {
        const pct = Math.max(8, Math.round((v / max) * 100));
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${
              isLast && highlightLast ? "bg-teal-500" : color
            }`}
            style={{ height: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  radius?: number;
  strokeWidth?: number;
  colorClass?: string;
  trailColorClass?: string;
  size?: number;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  radius = 36,
  strokeWidth = 6,
  colorClass = 'text-emerald-500',
  trailColorClass = 'text-zinc-800 dark:text-zinc-800 light:text-zinc-200',
  size,
  label
}) => {
  const normalizedRadius = radius;
  const circumference = normalizedRadius * 2 * Math.PI;
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    // Set animated offset after mount to trigger transition
    const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
    setStrokeDashoffset(offset);
  }, [percentage, circumference]);

  const diameter = (normalizedRadius + strokeWidth) * 2;
  const actualSize = size || diameter;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: actualSize, height: actualSize }}>
      <svg
        height={actualSize}
        width={actualSize}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          className={`${trailColorClass} stroke-current`}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={diameter / 2}
          cy={diameter / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={diameter / 2}
          cy={diameter / 2}
        />
      </svg>
      {/* Inner Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
          {Math.round(percentage)}%
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5 leading-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

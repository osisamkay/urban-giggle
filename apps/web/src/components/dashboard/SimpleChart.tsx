'use client';

import { useState } from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartData[];
  title?: string;
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

export function SimpleBarChart({
  data,
  title,
  color = '#dc2626',
  height = 200,
  formatValue = (v) => `$${v.toLocaleString()}`,
}: SimpleChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="font-semibold text-gray-900 mb-6">{title}</h3>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = (item.value / maxValue) * (height - 50);
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className={`text-xs font-semibold transition-all duration-200 ${
                isHovered ? 'text-gray-900 scale-110' : 'text-gray-500'
              }`}>
                {formatValue(item.value)}
              </span>
              <div
                className="w-full rounded-t-lg transition-all duration-300 ease-out relative"
                style={{
                  height: Math.max(barHeight, 6),
                  background: isHovered
                    ? `linear-gradient(to top, ${color}, ${color}dd)`
                    : `linear-gradient(to top, ${color}99, ${color}cc)`,
                  transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  boxShadow: isHovered ? `0 -4px 12px ${color}40` : 'none',
                }}
                title={`${item.label}: ${formatValue(item.value)}`}
                role="img"
                aria-label={`${item.label}: ${formatValue(item.value)}`}
              />
              <span className={`text-[10px] truncate w-full text-center transition-colors ${
                isHovered ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donut Chart
interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  title?: string;
  size?: number;
}

export function SimpleDonutChart({ data, title, size = 160 }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedOffset = 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {title && <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, i) => {
              const percentage = item.value / total;
              const dashLength = circumference * percentage;
              const dashOffset = circumference * accumulatedOffset;
              accumulatedOffset += percentage;
              const isHovered = hoveredIndex === i;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-dashOffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{ opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1 }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                  isHovered ? 'scale-105' : ''
                } ${hoveredIndex !== null && !isHovered ? 'opacity-40' : ''}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-400">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Progress Bar with label
export function SimpleLineIndicator({
  label,
  value,
  maxValue,
  color = '#dc2626',
}: {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        />
      </div>
    </div>
  );
}

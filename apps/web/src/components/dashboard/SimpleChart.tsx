'use client';

// Lightweight bar chart — no external dependency needed
// For production, swap with recharts or chart.js

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
  if (!data.length) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">
                {formatValue(item.value)}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: Math.max(barHeight, 4),
                  backgroundColor: color,
                  opacity: 0.7 + (item.value / maxValue) * 0.3,
                }}
                title={`${item.label}: ${formatValue(item.value)}`}
                role="img"
                aria-label={`${item.label}: ${formatValue(item.value)}`}
              />
              <span className="text-xs text-gray-500 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label}: ${value} of ${maxValue}`}
        />
      </div>
    </div>
  );
}

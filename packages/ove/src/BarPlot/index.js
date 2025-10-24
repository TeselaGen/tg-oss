/**
 * Minimal SVG BarPlot component
 * @param {Object} props
 * @param {number[]} props.data - Array of numbers to plot
 * @param {number} [props.width=300]
 * @param {number} [props.height=150]
 * @param {string[]} [props.barColors]
 */
import React from "react";
export function BarPlot({
  data,
  width = 300,
  height = 30,
  barColors,
  className
}) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data);
  const barWidth = width / data.length;

  return (
    <svg width={width} height={height} className={className}>
      {data.map((val, i) => {
        const barHeight = (val / maxVal) * (height - 2);
        return (
          <rect
            data-tip={`${val?.toFixed(1)}%`}
            key={i}
            x={i * barWidth + 1}
            y={height - barHeight}
            width={barWidth - 2}
            height={barHeight}
            fill={barColors ? barColors[i % barColors.length] : "#3498db"}
            rx={2}
          />
        );
      })}
      {/* 50% horizontal line */}
      <line
        x1={1}
        y1={height - 0.5 * (height - 2)}
        x2={width}
        y2={height - 0.5 * (height - 2)}
        stroke="white"
        strokeDasharray="4,2"
        strokeWidth={1}
      />
      <line
        x1={0}
        y1={height}
        x2={width}
        y2={height}
        stroke="#333"
        strokeWidth={1}
      />
    </svg>
  );
}

export function AminoAcidCirclePlot({ data, width, className }) {
  // width: total SVG width to fit all circles
  const n = data.length;
  if (n === 0) return null;

  // Calculate spacing and radius so circles fit the width
  const padding = 5; // space at each end
  const availableWidth = width - 3 * padding;
  const spacing = n > 1 ? availableWidth / (n - 1) : 0;
  // Make radius as large as possible without overlap
  const maxRadius = spacing / 2 - 2 > 0 ? spacing / 2 - 2 : 8;
  const radius = Math.max(8, Math.min(maxRadius, 20));
  const svgHeight = radius * 2 + 10;

  return (
    <svg width={width} height={svgHeight} className={className}>
      {/* Circles */}
      {data.map((d, idx) => (
        <g key={idx}>
          <circle
            data-tip={d.group}
            cx={idx * spacing + radius}
            cy={radius + 2}
            r={radius}
            fill={d.color}
            stroke="#333"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * Stacked SVG BarPlot component for multiple properties per bar
 * @param {Object} props
 * @param {number[][]} props.data - Array of arrays, each inner array is the values for that position
 * @param {number} [props.width=300]
 * @param {number} [props.height=30]
 * @param {string[]} [props.barColors]
 */
export function StackedBarPlot({ data, width = 300, height = 30, barColors }) {
  if (!data || data.length === 0) return null;

  const _data = data.map(vals => Object.values(vals));
  const legends = data.map(vals => Object.keys(vals));

  // Find the max sum for stacking
  const maxVal = Math.max(
    ..._data.map(vals => vals.reduce((a, b) => a + b, 0))
  );
  const barWidth = width / _data.length;

  return (
    <svg width={width} height={height}>
      {_data.map((vals, i) => {
        let yOffset = height;
        return vals.map((val, j) => {
          const barHeight = (val / maxVal) * (height - 2);
          yOffset -= barHeight;
          return (
            <rect
              data-tip={legends[i][j]}
              key={j}
              x={i * barWidth + 1}
              y={yOffset}
              width={barWidth - 2}
              height={barHeight}
              fill={barColors ? barColors[j % barColors.length] : colorMap[j]}
              rx={2}
            />
          );
        });
      })}
      <line
        x1={0}
        y1={height}
        x2={width}
        y2={height}
        stroke="#333"
        strokeWidth={1}
      />
    </svg>
  );
}

const colorMap = [
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#d62728", // red
  "#9467bd", // purple
  "#8c564b", // brown
  "#e377c2", // pink
  "#7f7f7f", // gray
  "#bcbd22" // olive
];

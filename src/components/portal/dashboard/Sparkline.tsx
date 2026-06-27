"use client";

import React from "react";

interface SparklineProps {
  history: number[];
  color: "blue" | "emerald" | "amber" | "purple";
}

export default function Sparkline({ history = [], color = "blue" }: SparklineProps) {
  const width = 120;
  const height = 36;

  let points = "";
  let fillPath = "";

  if (history.length > 1) {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const coordinates = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      // Leave 3px padding top and bottom
      const y = height - 3 - ((val - min) / range) * (height - 6);
      return { x, y };
    });

    points = coordinates.map((c) => `${c.x},${c.y}`).join(" ");
    fillPath = `M 0,${height} L ${points} L ${width},${height} Z`;
  }

  const gradientColors = {
    blue: {
      start: "#3b82f6",
      end: "#60a5fa",
      fillStart: "rgba(59, 130, 246, 0.15)",
      fillEnd: "rgba(59, 130, 246, 0)",
    },
    emerald: {
      start: "#10b981",
      end: "#34d399",
      fillStart: "rgba(16, 185, 129, 0.15)",
      fillEnd: "rgba(16, 185, 129, 0)",
    },
    amber: {
      start: "#f59e0b",
      end: "#fbbf24",
      fillStart: "rgba(245, 158, 11, 0.15)",
      fillEnd: "rgba(245, 158, 11, 0)",
    },
    purple: {
      start: "#8b5cf6",
      end: "#a78bfa",
      fillStart: "rgba(139, 92, 246, 0.15)",
      fillEnd: "rgba(139, 92, 246, 0)",
    },
  }[color];

  const gradientId = `sparkline-grad-${color}`;
  const fillGradientId = `sparkline-fill-grad-${color}`;

  if (!points) {
    return <div className="h-8 w-24 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />;
  }

  return (
    <div className="w-24 sm:w-28 h-8 overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          {/* Stroke Gradient */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
          {/* Fill Area Gradient */}
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors.fillStart} />
            <stop offset="100%" stopColor={gradientColors.fillEnd} />
          </linearGradient>
        </defs>

        {/* Fill Area */}
        <path d={fillPath} fill={`url(#${fillGradientId})`} />

        {/* Stroke Line */}
        <polyline
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
